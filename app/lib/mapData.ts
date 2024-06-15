// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.$queryRaw`SELECT id, ST_AsText(geom::geometry) AS geom, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaescritura, superficie, monto, observaciones, colaborador_id FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from the database.');
    }

    const leafletData = data.map(item => {
      const coords = item.geom.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      // Verificar si alguna de las coordenadas no es un número o es NaN
      if (coords.some((coord: number) => isNaN(coord)) || coords[0] < -180 || coords[0] > 180 || coords[1] < -90 || coords[1] > 90) {
        console.error(`Invalid coordinates for item ${item.id}:`, coords);
        return null; // O manejar de otra manera
      }
      return {
        ...item,
        latLng: [coords[1], coords[0]] as [number, number], // Invertir las coordenadas
      };
    }).filter(item => item !== null); // Filtrar elementos nulos

    return leafletData;
  } catch (error) {
    console.error('Error fetching data for map:', error);
    throw error;
  }
}