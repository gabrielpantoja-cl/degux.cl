import { PrismaClient } from '@prisma/client';
import {
  ColaboradorField,
  ColaboradoresTable,
  ReferencialForm,
  ReferencialesTable,
  User,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referencial.findMany({
      take: 5,
      orderBy: [
        {
          date: 'desc',
        },
      ],
      select: {
        anio: true,
        colaborador_id: {
          select: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
        id: true,
      },
    });

    const latestReferenciales = data.map((referencial) => ({
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
    const referencialCountPromise = prisma.referencial.count();
    const referencialStatusPromise = prisma.referencial.groupBy({
      by: ['status'],

    });

    const data = await Promise.all([
      referencialCountPromise,
      referencialStatusPromise,
    ]);

    const [numberOfReferenciales, numberOfColaboradores, referencialStatus] = await Promise.all([
      prisma.referencial.count(),
      prisma.colaboradores.count(),
      prisma.referencial.groupBy({
        by: ['status'],
        sum: {
          monto: true
        }
      }),
    ]);

    const totalPaidReferenciales = formatCurrency(
      referencialStatus
        .filter((group) => group.status === 'PAID')
        .reduce((sum, group) => sum + group.monto, 0)
    );

    const totalPendingReferenciales = formatCurrency(
      referencialStatus
        .filter((group) => group.status === 'PENDING')
        .reduce((sum, group) => sum + group.monto, 0)
    );

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
