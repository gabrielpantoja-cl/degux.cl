// lib/prisma.ts

/**
 * Configuración del cliente Prisma para la aplicación
 * Implementa el patrón Singleton para evitar múltiples instancias en desarrollo
 */

import { PrismaClient } from '@prisma/client';

// Añadir tipado más específico para el objeto global
declare global {
  var prisma: PrismaClient | undefined;
}

// Crear una única instancia de PrismaClient
const prisma = global.prisma || new PrismaClient();

// Solo asignar prisma al objeto global en desarrollo
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Exportar la instancia de prisma con diferentes nombres para mantener compatibilidad
export const db = prisma;
export const prismaClient = prisma;
export { prisma };

// Exportación por defecto para casos especiales
export default prisma;