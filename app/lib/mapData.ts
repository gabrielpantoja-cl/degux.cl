// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    // Seleccionar directamente las columnas lat y lng, que ya están en el formato correcto
    const data = await prisma.$queryRaw`SELECT id, lat, lng, fojas, numero, anio, cbr, comprador, vendedor, predio, comuna, rol, fechaescritura, superficie, monto, observaciones, colaborador_id FROM referenciales`;

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la base de datos no es un arreglo.');
    }

    const leafletData = data.map(item => {
      // Dividir el valor de las coordenadas y convertir a números
      const [lat, lng] = item.lat.split(';').map((coord: string) => parseFloat(coord.trim()));
      // Verificar si alguna de las coordenadas no es un número o es NaN
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Coordenadas inválidas para el item ${item.id}: lat=${lat}, lng=${lng}`);
        return null; // O manejar de otra manera
      }
      // Asegurar que las coordenadas están dentro de los límites válidos
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error(`Coordenadas fuera de límites para el item ${item.id}: lat=${lat}, lng=${lng}`);
        return null;
      }
      return {
        ...item,
        latLng: [lat, lng] as [number, number],
      };
    }).filter(item => item !== null); // Filtrar elementos nulos

    return leafletData;
  } catch (error) {
    console.error('Error al obtener datos para el mapa:', error);
    throw error;
  }
}