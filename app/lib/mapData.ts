// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.$queryRaw`SELECT id, ST_X(geom::geometry) AS lat, ST_Y(geom::geometry) AS lng, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaescritura, superficie, monto, observaciones, colaborador_id FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la base de datos no es un arreglo.');
    }

    const leafletData = data.map(item => {
      // Verificar si alguna de las coordenadas no es un número o es NaN
      if (isNaN(item.lat) || isNaN(item.lng)) {
        console.error(`Coordenadas inválidas para el item ${item.id}: lat=${item.lat}, lng=${item.lng}`);
        return null; // O manejar de otra manera
      }
      // Asegurar que las coordenadas están dentro de los límites válidos
      if (item.lat < -90 || item.lat > 90 || item.lng < -180 || item.lng > 180) {
        console.error(`Coordenadas fuera de límites para el item ${item.id}: lat=${item.lat}, lng=${item.lng}`);
        return null;
      }
      return {
        ...item,
        latLng: [item.lat, item.lng] as [number, number],
      };
    }).filter(item => item !== null); // Filtrar elementos nulos

    return leafletData;
  } catch (error) {
    console.error('Error al obtener datos para el mapa:', error);
    throw error;
  }
}