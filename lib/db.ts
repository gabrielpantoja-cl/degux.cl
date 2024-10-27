// app/lib/db.ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // Añadir prismaGlobal a la declaración global
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = global.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;

export const db = prisma;