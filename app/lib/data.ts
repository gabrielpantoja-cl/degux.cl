import { sql } from '@vercel/postgres';
import {
  ColaboradorField,
  ColaboradoresTable,
  ReferencialForm,
  ReferencialesTable,
  LatestReferencialRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  noStore();
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql`SELECT * FROM revenue`;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await sql<LatestReferencialRaw>`
      SELECT referenciales.amount, colaboradores.name, colaboradores.image_url, colaboradores.email, referenciales.id
      FROM referenciales
      JOIN colaboradores ON referenciales.colaborador_id = colaboradores.id
      ORDER BY referenciales.date DESC
      LIMIT 5`;

    const latestReferenciales = data.rows.map((referencial) => ({
      ...referencial,
      amount: formatCurrency(referencial.amount),
    }));
    return latestReferenciales;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest referenciales.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const referencialCountPromise = sql`SELECT COUNT(*) FROM referenciales`;
    const colaboradorCountPromise = sql`SELECT COUNT(*) FROM colaboradores`;
    const referencialStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM referenciales`;

    const data = await Promise.all([
      referencialCountPromise,
      colaboradorCountPromise,
      referencialStatusPromise,
    ]);

    const numberOfReferenciales = Number(data[0].rows[0].count ?? '0');
    const numberOfColaboradores = Number(data[1].rows[0].count ?? '0');
    const totalPaidReferenciales = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingReferenciales = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfColaboradores,
      numberOfReferenciales,
      totalPaidReferenciales,
      totalPendingReferenciales,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredReferenciales(query: string, currentPage: number,) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const referenciales = await sql<ReferencialesTable>`
      SELECT
        referenciales.id,
        referenciales.fojas,  
        referenciales.numero,
        referenciales.anio,
        referenciales.amount,
        referenciales.date,
        referenciales.status,
        colaboradores.name,
        colaboradores.email,
        colaboradores.image_url
      FROM referenciales
      JOIN colaboradores ON referenciales.colaborador_id = colaboradores.id
      WHERE
        colaboradores.name ILIKE ${`%${query}%`} OR
        colaboradores.email ILIKE ${`%${query}%`} OR
        referenciales.amount::text ILIKE ${`%${query}%`} OR
        referenciales.date::text ILIKE ${`%${query}%`} OR
        referenciales.status ILIKE ${`%${query}%`}
      ORDER BY referenciales.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return referenciales.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch referenciales.');
  }
}

export async function fetchReferencialesPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM referenciales
    JOIN colaboradores ON referenciales.colaborador_id = colaboradores.id
    WHERE
      colaboradores.name ILIKE ${`%${query}%`} OR
      colaboradores.email ILIKE ${`%${query}%`} OR
      referenciales.amount::text ILIKE ${`%${query}%`} OR
      referenciales.date::text ILIKE ${`%${query}%`} OR
      referenciales.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of referenciales.');
  }
}

export async function fetchReferencialById(id: string) {
  noStore();
  try {
    const data = await sql<ReferencialForm>`
      SELECT
        referenciales.id,
        referenciales.colaborador_id,
        referenciales.amount,
        referenciales.status
      FROM referenciales
      WHERE referenciales.id = ${id};
    `;

    const referencial = data.rows.map((referencial) => ({
      ...referencial,
      // Convert amount from cents to dollars
      amount: referencial.amount / 100,
    }));

    return referencial[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchColaboradores() {
  noStore();
  try {
    const data = await sql<ColaboradorField>`
      SELECT
        id,
        name
      FROM colaboradores
      ORDER BY name ASC
    `;

    const colaboradores = data.rows;
    return colaboradores;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all colaboradores.');
  }
}

export async function fetchFilteredColaboradores(query: string) {
  noStore();
  try {
    const data = await sql<ColaboradoresTable>`
		SELECT
		  colaboradores.id,
		  colaboradores.name,
		  colaboradores.email,
		  colaboradores.image_url,
		  COUNT(referenciales.id) AS total_referenciales,
		  SUM(CASE WHEN referenciales.status = 'pending' THEN referenciales.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN referenciales.status = 'paid' THEN referenciales.amount ELSE 0 END) AS total_paid
		FROM colaboradores
		LEFT JOIN referenciales ON colaboradores.id = referenciales.colaborador_id
		WHERE
		  colaboradores.name ILIKE ${`%${query}%`} OR
        colaboradores.email ILIKE ${`%${query}%`}
		GROUP BY colaboradores.id, colaboradores.name, colaboradores.email, colaboradores.image_url
		ORDER BY colaboradores.name ASC
	  `;

    const colaboradores = data.rows.map((colaborador) => ({
      ...colaborador,
      total_pending: formatCurrency(colaborador.total_pending),
      total_paid: formatCurrency(colaborador.total_paid),
    }));

    return colaboradores;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch colaborador table.');
  }
}

export async function getUser(email: string) {
  noStore();
  try {
    const user = await sql`SELECT * from USERS where email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
