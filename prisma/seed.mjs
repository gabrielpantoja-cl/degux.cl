import { prisma } from '@/lib/prisma'; // Importa la instancia única de PrismaClient
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // Importar bcrypt

dotenv.config(); // Cargar las variables de entorno

async function main() {
  // Crear usuario básico
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.users.create({
    data: {
      id: uuidv4(),
      email: 'user@nextmail.com',
      password: hashedPassword,
      name: 'Next.js 14 Dashboard User'
    },
  });

  const valdiviaCoordinates = [
    { lat: -39.8196, lng: -73.2452 },
    { lat: -39.8142, lng: -73.2458 },
    { lat: -39.8123, lng: -73.2471 },
    { lat: -39.8154, lng: -73.2500 },
    { lat: -39.8178, lng: -73.2425 }
  ];

  // Crear referenciales
  for (const coord of valdiviaCoordinates) {
    await prisma.referenciales.create({
      data: {
        id: uuidv4(),
        colaborador_id: user.id,
        lat: coord.lat,
        lng: coord.lng,
        location: { lat: coord.lat, lng: coord.lng },
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