// app/lib/referenciales.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referenciales.findMany({
      take: 5,
      orderBy: {
        fechaDeEscritura: 'desc',
      },
      include: {
        colaborador: true,
      },
    });

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from the database.');
    }

    const latestReferenciales = data.map((referencial) => {
      if (typeof referencial.monto !== 'number') {
        throw new Error('Unexpected data type for "monto".');
      }

      return {
        ...referencial,
        amount: formatCurrency(referencial.monto),
      };
    });

    return latestReferenciales;
  } catch (error) {
    console.error('Database Error:', error);

    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      throw new Error('Failed to fetch the latest referenciales. Original error: ' + error.message);
    } else {
      throw error;
    }
  }
}

export async function fetchFilteredReferenciales(query: string, currentPage: number) {
  console.log('Iniciando fetchFilteredReferenciales con query:', query, 'y currentPage:', currentPage);
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let dateQuery;
  if (Date.parse(query)) {
    dateQuery = new Date(query);
  }

  try {
    console.log('Iniciando consulta a la base de datos...');
    const referenciales = await prisma.referenciales.findMany({
      where: {

      },
      orderBy: {
        fechaDeEscritura: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      include: {
        colaborador: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('Consulta a la base de datos completada. Referenciales obtenidos:', referenciales);
    return referenciales;
  } catch (error) {
    console.error('Error en la base de datos:', error);
    throw error;
  }
}

export async function fetchReferencialesPages(query: string) {
  noStore();

  let dateQuery;
  if (Date.parse(query)) {
    dateQuery = new Date(query);
  }

  try {
    const count = await prisma.referenciales.count({
      where: {

      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of referenciales.');
  }
}

export async function fetchReferencialById(id: string) {
  noStore();
  try {
    const referencial = await prisma.referenciales.findUnique({
      where: {
        id: id,
      },
    });

    if (!referencial) {
      throw new Error(`No referencial found with id: ${id}`);
    }

    return {
      ...referencial,
      amount: referencial.monto / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
  }
}
