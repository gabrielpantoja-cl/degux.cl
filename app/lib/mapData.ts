// app/lib/mapData.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.$queryRaw`SELECT id, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaDeEscritura, superficie, monto, observaciones, colaborador FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from the database.');
    }

    // Map data to format suitable for Leaflet
    const leafletData = data.map(item => ({
      ...item,
      latLng: [item.lat, item.lng] as [number, number],
    }));

    return leafletData;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}