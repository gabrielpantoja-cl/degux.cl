'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referenciales.findMany({
      take: 5,
      orderBy: {
        fechaescritura: 'desc',
      },
      include: {
        user: true,
        conservador: true, // Incluir relación con conservadores
      },
    });

    if (!data || !Array.isArray(data)) {
      throw new Error('Respuesta inesperada de la base de datos.');
    }

    const latestReferenciales = data.map((referencial) => ({
      ...referencial,
      amount: formatCurrency(referencial.monto),
    }));

    return latestReferenciales;
  } catch (error) {
    console.error('Error de base de datos:', error);
    throw error instanceof Error 
      ? new Error(`Error al obtener últimas referencias: ${error.message}`)
      : new Error('Error desconocido al obtener referencias');
  }
}

export async function fetchFilteredReferenciales(query: string, currentPage: number) {
  noStore();
  
  // Validación y sanitización de parámetros
  const safeQuery = typeof query === 'string' ? query : '';
  const safePage = Math.max(1, Number(currentPage) || 1);
  const offset = (safePage - 1) * ITEMS_PER_PAGE;

  try {
    // Construir whereCondition con tipos correctos de Prisma
    const whereCondition: Prisma.referencialesWhereInput = safeQuery.trim() 
      ? {
          OR: [
            { comuna: { contains: safeQuery, mode: 'insensitive' } },
            { predio: { contains: safeQuery, mode: 'insensitive' } },
            { comprador: { contains: safeQuery, mode: 'insensitive' } },
            { vendedor: { contains: safeQuery, mode: 'insensitive' } }
          ]
        } 
      : {};

    // Ejecutar consulta con manejo de errores mejorado
    const referenciales = await prisma.referenciales.findMany({
      where: whereCondition,
      orderBy: {
        fechaescritura: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        conservador: {
          select: {
            nombre: true,
            comuna: true,
          },
        },
      },
    });

    // Validar resultado
    if (!Array.isArray(referenciales)) {
      throw new Error('Respuesta inesperada de la base de datos');
    }

    return referenciales;

  } catch (error) {
    console.error('Error en la base de datos:', error);
    // Retornar array vacío en lugar de null
    return [];
  }
}

export async function fetchReferencialesPages(query: string = '') {
  noStore();

  try {
    const count = await prisma.referenciales.count({
      where: {
        OR: query ? [
          { comuna: { contains: query, mode: 'insensitive' } },
          { predio: { contains: query, mode: 'insensitive' } },
          { comprador: { contains: query, mode: 'insensitive' } },
          { vendedor: { contains: query, mode: 'insensitive' } }
        ] : undefined
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages || 1; // Asegurar que siempre hay al menos 1 página
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
      include: {
        conservador: true, // Incluir la relación con conservador
        user: true
      }
    });

    if (!referencial) {
      throw new Error(`No referencial found with id: ${id}`);
    }

    return {
      ...referencial,
      amount: formatCurrency(referencial.monto),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw error instanceof Error 
      ? new Error(`Error al obtener referencial: ${error.message}`)
      : new Error('Error desconocido al obtener referencial');
  }
}

interface ComunaGroupResult {
  comuna: string;
  _count: {
    comuna: number;
  } | null;
}

interface FormattedComuna {
  comuna: string;
  count: number;
}

export async function fetchTopComunas() {
  noStore();
  try {
    const comunasData = await prisma.referenciales.groupBy({
      by: ['comuna'],
      _count: {
        comuna: true
      },
      orderBy: {
        _count: {
          comuna: 'desc'
        }
      },
      take: 4,
      where: {
        comuna: {
          not: ''  // Filtrar comunas vacías
        }
      }
    });

    // Formatear datos para el gráfico con tipos seguros
    const formattedData = comunasData.map((item: ComunaGroupResult): FormattedComuna => ({
      comuna: item.comuna,
      count: item._count?.comuna ?? 0
    }));

    console.log('Top comunas obtenidas:', formattedData);
    return formattedData;

  } catch (error) {
    console.error('Error al obtener top comunas:', error);
    throw new Error('Error al obtener las comunas con más referenciales');
  }
}