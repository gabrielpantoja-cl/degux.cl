// app/lib/prisma.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

export { prisma, noStore };