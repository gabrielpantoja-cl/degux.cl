import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

const prisma = new PrismaClient();

async function main() {
  const colaborador = await prisma.colaboradores.create({
    data: {
      id: uuidv4(),
      name: 'Juan Perez',
      email: 'juan.perez@example.com',
      image_url: 'https://example.com/image.jpg'
    },
  });

  const valdiviaCoordinates = [
    { lat: -39.8196, lng: -73.2452 },
    { lat: -39.8142, lng: -73.2458 },
    { lat: -39.8123, lng: -73.2471 },
    { lat: -39.8154, lng: -73.2500 },
    { lat: -39.8178, lng: -73.2425 }
  ];

  for (const coord of valdiviaCoordinates) {
    await prisma.referenciales.create({
      data: {
        id: uuidv4(),
        colaborador_id: colaborador.id,
        lat: coord.lat,
        lng: coord.lng,
        fojas: 123,
        numero: 1,
        anio: 2023,
        cbr: 'CBR123',
        comprador: 'Comprador Ejemplo',
        vendedor: 'Vendedor Ejemplo',
        predio: 'Predio Ejemplo',
        comuna: 'Valdivia',
        rol: '00000-00000',
        fechaescritura: new Date(),
        superficie: 100.0,
        monto: 1000000,
        observaciones: 'Observaciones Ejemplo'
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });