// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.$queryRaw`SELECT id, ST_AsText(geom::geometry) AS geom, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaDeEscritura, superficie, monto, observaciones, colaborador FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from the database.');
    }

    const leafletData = data.map(item => {
      const coords = item.geom.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      return {
        ...item,
        latLng: [coords[1], coords[0]] as [number, number], // Invertir las coordenadas
      };
    });

    return leafletData;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}