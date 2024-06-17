// app/lib/referenciales.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

// Función auxiliar para manejar errores de manera uniforme
function handleDatabaseError(error: unknown) {
  console.error('Error en la base de datos:', error);
  if (error instanceof Error) {
    throw new Error('Error al acceder a la base de datos. Detalle del error: ' + error.message);
  } else {
    throw new Error('Error desconocido al acceder a la base de datos.');
  }
}

// Función auxiliar para validar y transformar la consulta de fecha
function getDateQuery(query: string): Date | undefined {
  if (Date.parse(query)) {
    return new Date(query);
  }
  return undefined;
}

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referenciales.findMany({
      take: 5,
      orderBy: {
        fechaescritura: 'desc',
      },
      include: {
        colaborador: true,
      },
    });

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inesperada de la base de datos.');
    }

    const latestReferenciales = data.map((referencial) => {
      if (typeof referencial.monto !== 'number') {
        throw new Error('Tipo de dato inesperado para "monto".');
      }

      return {
        ...referencial,
        amount: formatCurrency(referencial.monto),
      };
    });

    return latestReferenciales;
  } catch (error) {
    handleDatabaseError(error);
  }
}

export async function fetchReferencialesPages() {
  noStore();
  try {
    // Obtener el conteo total de referenciales
    const totalReferenciales = await prisma.referenciales.count();
    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalReferenciales / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    handleDatabaseError(error);
  }
}

export async function fetchFilteredReferenciales(query: string, currentPage: number) {
  console.log('Iniciando fetchFilteredReferenciales con query:', query, 'y currentPage:', currentPage);
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const dateQuery = getDateQuery(query);
  let whereClause = {};
  if (dateQuery) {
    whereClause = {
      fechaescritura: {
        equals: dateQuery,
      },
    };
  }

  try {
    console.log('Iniciando consulta a la base de datos...');
    const referenciales = await prisma.referenciales.findMany({
      where: whereClause,
      orderBy: {
        fechaescritura: 'desc',
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
    handleDatabaseError(error);
  }
}