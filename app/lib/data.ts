import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTable,
  ReferencialForm,
  ReferencialesTable,
  LatestReferencialRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  // Add noStore() here prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    // Artificially delay a reponse for demo purposes.
    // Don't do this in real life :)

    // console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    // console.log('Data fetch complete after 3 seconds.');

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
      SELECT referenciales.amount, customers.name, customers.image_url, customers.email, referenciales.id
      FROM referenciales
      JOIN customers ON referenciales.customer_id = customers.id
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
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const referencialStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM referenciales`;

    const data = await Promise.all([
      referencialCountPromise,
      customerCountPromise,
      referencialStatusPromise,
    ]);

    const numberOfReferenciales = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidReferenciales = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingReferenciales = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
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
        customers.name,
        customers.email,
        customers.image_url
      FROM referenciales
      JOIN customers ON referenciales.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
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
    JOIN customers ON referenciales.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
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
        referenciales.customer_id,
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

export async function fetchCustomers() {
  noStore();
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  try {
    const data = await sql<CustomersTable>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(referenciales.id) AS total_referenciales,
		  SUM(CASE WHEN referenciales.status = 'pending' THEN referenciales.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN referenciales.status = 'paid' THEN referenciales.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN referenciales ON customers.id = referenciales.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
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
