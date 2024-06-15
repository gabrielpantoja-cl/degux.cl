// app/lib/mapData.ts

'use server';

// Importación de PrismaClient comentada ya que no se realizarán operaciones de base de datos
// import { PrismaClient } from '@prisma/client';

// Instancia de PrismaClient comentada ya que no se realizarán operaciones de base de datos
// const prisma = new PrismaClient();

// Función comentada que originalmente buscaba datos geográficos en la base de datos,
// los transformaba para su uso con Leaflet y manejaba errores.
/*
export async function fetchReferencialesForMap() {
  try {
    // Consulta a la base de datos para obtener datos geográficos y otros detalles
    const data = await prisma.$queryRaw`SELECT id, ST_AsText(geom::geometry) AS geom, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaescritura, superficie, monto, observaciones, colaborador_id FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response from the database.');
    }

    // Transformación de datos crudos a formato compatible con Leaflet
    const leafletData = data.map(item => {
      const coords = item.geom.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      // Verificación de validez de coordenadas
      if (coords.some((coord: number) => isNaN(coord)) || coords[0] < -180 || coords[0] > 180 || coords[1] < -90 || coords[1] > 90) {
        console.error(`Invalid coordinates for item ${item.id}:`, coords);
        return null; // O manejar de otra manera
      }
      // Preparación de datos para Leaflet
      return {
        ...item,
        latLng: [coords[1], coords[0]] as [number, number], // Invertir las coordenadas
      };
    }).filter(item => item !== null); // Filtrado de elementos nulos

    return leafletData;
  } catch (error) {
    // Manejo de errores durante la consulta o transformación de datos
    console.error('Error fetching data for map:', error);
    throw error;
  }
}
*/