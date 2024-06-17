// app/lib/colaboradores.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

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

    return colaboradores.map(({ id, name, email, image_url }) => ({
      id,
      name,
      email,
      image_url,
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch colaborador table.');
  }
}