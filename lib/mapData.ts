// app/lib/mapData.ts
'use server';

import { prisma } from '@/lib/prisma'; // Importa la instancia única de PrismaClient

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        id, 
        ST_AsGeoJSON(geom) as geojson, 
        fojas, 
        numero, 
        anio, 
        cbr, 
        comprador, 
        vendedor, 
        predio, 
        comuna, 
        rol, 
        fechaescritura, 
        superficie, 
        monto, 
        observaciones, 
        colaborador_id 
      FROM referenciales 
      WHERE geom IS NOT NULL
    `;

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la base de datos no es un arreglo.');
    }

    const leafletData = data.map(item => {
      const geojson = JSON.parse(item.geojson);
      const [lng, lat] = geojson.coordinates;

      return {
        ...item,
        latLng: [lat, lng] as [number, number],
        geom: [lng, lat],
        fechaescritura: item.fechaescritura ? new Date(item.fechaescritura).toISOString() : null,
        geojson: undefined,
      };
    });

    return leafletData;
  } catch (error) {
    console.error('Error al obtener datos para el mapa:', error);
    throw error;
  }
}