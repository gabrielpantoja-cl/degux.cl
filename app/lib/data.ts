import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

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
      // Handle generic errors here
      console.error('Error Message:', error.message);
      throw new Error('Failed to fetch the latest referenciales. Original error: ' + error.message);
    } else {
      throw error;
    }
  }
}

export async function fetchCardData() {
  noStore();
  try {
    const referencialCountPromise = prisma.referenciales.count();
    const colaboradorCountPromise = prisma.colaboradores.count();

    const data = await Promise.all([
      referencialCountPromise,
      colaboradorCountPromise,
    ]);

    const numberOfReferenciales = Number(data[0]);
    const numberOfColaboradores = Number(data[1]);

    return {
      numberOfColaboradores,
      numberOfReferenciales,
    };
  } catch (error) {
    console.error('Database Error:', error);
    if (error instanceof Error) {
      throw new Error('Failed to fetch card data. Original error: ' + error.message);
    } else {
      throw new Error('Failed to fetch card data.');
    }
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredReferenciales(query: string, currentPage: number) {
  console.log('Iniciando fetchFilteredReferenciales con query:', query, 'y currentPage:', currentPage);
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  console.log('Offset calculado:', offset);

  try {
    console.log('Iniciando consulta a la base de datos...');
    const referenciales = await prisma.referenciales.findMany({
      where: {
        OR: [
          { colaborador: { name: { contains: query, mode: "insensitive" } } },
          { colaborador: { email: { contains: query, mode: "insensitive" } } },
          { monto: { equals: Number(query) } },
          { fechaDeEscritura: { equals: new Date(query) } },
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

    console.log('Consulta a la base de datos completada. Referenciales obtenidos:', referenciales);
    return referenciales;
  } catch (error) {
    console.error('Error en la base de datos:', error);
    throw new Error('Falló al obtener los referenciales.');
  }
}

export async function fetchReferencialesPages(query: string) {
  noStore();
  try {
    const count = await prisma.referenciales.count({
      where: {
        OR: [
          { colaborador: { name: { contains: query, mode: "insensitive" } } },
          { colaborador: { email: { contains: query, mode: "insensitive" } } },
          { monto: { equals: Number(query) } },
          { fechaDeEscritura: { equals: new Date(query) } },
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

export async function fetchColaboradores() {
  noStore();
  try {
    const colaboradores = await prisma.colaboradores.findMany({
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
    const colaboradores = await prisma.colaboradores.groupBy({
      by: ['id', 'name', 'email', 'image_url'],
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
      image_url: colaborador.image_url,
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch colaborador table.');
  }
}

export async function getUser(email: string) {
  noStore();
  try {
    const user = await prisma.users.findUnique({
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