// app/lib/mapData.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const referenciales = await prisma.referenciales.findMany({
      select: {
        id: true,
        geom: true, // Asegúrate de que 'geom' sea el campo correcto en tu modelo Prisma
        fojas: true,
        numero: true,
        anio: true,
        cbr: true,
        comprador: true,
        vendedor: true,
        predio: true,
        comuna: true,
        rol: true,
        fechaescritura: true,
        superficie: true,
        monto: true,
        observaciones: true,
        colaborador_id: true,
      },
    });

    const leafletData = referenciales.map(referencial => {
      const geomText = referencial.geom; // Asumiendo que 'geom' es un string con el formato 'POINT(LNG LAT)'
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
    console.error('Error fetching data for map:', error);
    throw new Error(`Error fetching data for map: ${error.message}`);
  }
}