// app/lib/mapData.ts

'use server';
// app/lib/mapData.ts

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
const referenciales = await prisma.$queryRaw<Prisma.referencialesUncheckedCreateInput[]>(Prisma.sql`      SELECT id, ST_AsText(geom) as geom, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaescritura, superficie, monto, observaciones, colaborador_id
      FROM "Referenciales"
    `);

    const leafletData = referenciales.map(referencial => {
      const geomText = referencial.geom; // 'geom' ahora es un string WKT gracias a ST_AsText
      const coords = geomText.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      if (coords.some(coord => isNaN(coord)) || coords[0] < -180 || coords[0] > 180 || coords[1] < -90 || coords[1] > 90) {
        console.error(`Invalid coordinates for item ${referencial.id}:`, coords);
        return null;
      }
      return {
        ...referencial,
        latLng: [coords[1], coords[0]], // Invertir las coordenadas para Leaflet
      };
    }).filter(referencial => referencial !== null);

    return leafletData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching data for map:', error.message);
      throw new Error(`Error fetching data for map: ${error.message}`);
    } else {
      console.error('Error fetching data for map:', error);
      throw new Error('Error fetching data for map');
    }
  }
}