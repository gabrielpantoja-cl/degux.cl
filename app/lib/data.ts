import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referencialesTable.findMany({
      take: 5,
      orderBy: {
        fechaDeEscritura: 'desc',
      },
      include: {
        colaborador: true,
      },
    });

    const latestReferenciales = data.map((referencial) => ({
      ...referencial,
      amount: formatCurrency(referencial.monto),
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
    const referencialCountPromise = prisma.referencialesTable.count();
    const colaboradorCountPromise = prisma.colaborador.count();
    const referencialStatusPromise = prisma.referencialesTable.groupBy({
      by: ['status'],
      where: {
        OR: [
          { status: 'paid' },
          { status: 'pending' }
        ]
      }
    });

    const data = await Promise.all([
      referencialCountPromise,
      colaboradorCountPromise,
      referencialStatusPromise,
    ]);

    const numberOfReferenciales = Number(data[0]);
    const numberOfColaboradores = Number(data[1]);

    return {
      numberOfColaboradores,
      numberOfReferenciales,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredReferenciales(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const referenciales = await prisma.referencialesTable.findMany({
      where: {
        OR: [
          { colaborador: { name: { contains: query, mode: "insensitive" } } },
          { colaborador: { email: { contains: query, mode: "insensitive" } } },
          { monto: { equals: Number(query) } },
          { fechaDeEscritura: { equals: new Date(query) } },
          { status: { contains: query, mode: "insensitive" } },
        ],
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

    return referenciales;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch referenciales.');
  }
}

export async function fetchReferencialesPages(query: string) {
  noStore();
  try {
    const count = await prisma.referencialesTable.count({
      where: {
        OR: [
          { colaborador: { name: { contains: query, mode: "insensitive" } } },
          { colaborador: { email: { contains: query, mode: "insensitive" } } },
          { monto: { equals: Number(query) } },
          { fechaDeEscritura: { equals: new Date(query) } },
          { status: { contains: query, mode: "insensitive" } },
        ],
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
    const referencial = await prisma.referencialesTable.findUnique({
      where: {
        id: Number(id),
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

export async function fetchColaboradores() {
  noStore();
  try {
    const colaboradores = await prisma.colaborador.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return colaboradores;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all colaboradores.');
  }
}

export async function fetchFilteredColaboradores(query: string) {
  noStore();
  try {
    const colaboradores = await prisma.colaborador.groupBy({
      by: ['id', 'name', 'email', 'imageUrl'],
      _count: {
        id: true,
      },
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });

    return colaboradores.map((colaborador) => ({
      id: colaborador.id,
      name: colaborador.name,
      email: colaborador.email,
      imageUrl: colaborador.imageUrl,
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch colaborador table.');
  }
}

export async function getUser(email: string) {
  noStore();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}