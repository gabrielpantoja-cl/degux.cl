// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    // Utilizar ST_AsGeoJSON para convertir la geometría a un formato compatible con Leaflet
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
      // Parsear el GeoJSON para obtener las coordenadas
      const geojson = JSON.parse(item.geojson);
      const [lng, lat] = geojson.coordinates;

      // No es necesario verificar NaN o límites ya que PostGIS asegura la validez de los datos
      return {
        ...item,
        latLng: [lat, lng] as [number, number],
        geojson: undefined, // Remover el campo geojson para no duplicar datos
      };
    });

    return leafletData;
  } catch (error) {
    console.error('Error al obtener datos para el mapa:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}