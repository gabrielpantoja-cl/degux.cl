import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Elimina datos existentes en la tabla conservadores (opcional, para empezar de cero)
    await prisma.conservadores.deleteMany();
    console.log('Datos existentes en conservadores eliminados');

    // Datos de ejemplo para la tabla conservadores
    const conservadores = [
      {
        id: '550e8400-e29b-41d8-a98c-22d0b8f8f1f0',
        nombre: 'Conservador de Bienes Raíces de Valdivia',
        direccion: 'Calle Ejemplo 123',
        comuna: 'Valdivia',
        region: 'Los Ríos',
        telefono: '123456789',
        email: 'contacto@conservadorvaldivia.cl',
        sitioWeb: 'https://www.conservadorvaldivia.cl',
      },
      {
        id: '550e8400-e29b-41d8-a98c-22d0b8f8f1f1',
        nombre: 'Conservador de Bienes Raíces de La Unión',
        direccion: 'Avenida Ejemplo 456',
        comuna: 'La Unión',
        region: 'Los Ríos',
        telefono: '987654321',
        email: 'contacto@conservadorlaunion.cl',
        sitioWeb: 'https://www.conservadorlaunion.cl',
      },
      {
        id: '550e8400-e29b-41d8-a98c-22d0b8f8f1f2',
        nombre: 'Conservador de Bienes Raíces de Río Bueno',
        direccion: 'Plaza Ejemplo 789',
        comuna: 'Río Bueno',
        region: 'Los Ríos',
        telefono: '112233445',
        email: 'contacto@conservadorriobueno.cl',
        sitioWeb: 'https://www.conservadorriobueno.cl',
      },
    ];

    // Inserta los datos en la tabla conservadores
    for (const conservador of conservadores) {
      await prisma.conservadores.create({
        data: conservador,
      });
    }

    console.log('Datos de conservadores creados correctamente');
  } catch (error) {
    console.error('Error al crear los datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error('Error en el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });