// app/lib/prisma.ts

'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };