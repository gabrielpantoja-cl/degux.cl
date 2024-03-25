// app/lib/mapData.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchReferencialesForMap() {
  try {
    const data = await prisma.referenciales.findMany({
      select: {
        id: true,
        lat: true,
        lng: true,
        fojas: true,
        numero: true,
        anio: true,
        cbr: true,
        comprador: true,
        vendedor: true,
        predio: true,
        comuna: true,
        rol: true,
        fechaDeEscritura: true,
        superficie: true,
        monto: true,
        observaciones: true,
        colaborador: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

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