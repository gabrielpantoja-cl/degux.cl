// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const ReferencialSchema = z.object({
  userId: z.string(),
  fojas: z.number(),
  numero: z.number(),
  anno: z.number(),
  cbr: z.string(),
  comuna: z.string(),
  fechaEscritura: z.string(),
  latitud: z.number(),
  longitud: z.number(),
  predio: z.string(),
  vendedor: z.string(),
  comprador: z.string(),
  superficie: z.number(),
  monto: z.number(),
  rolAvaluo: z.string(),
  observaciones: z.string().optional(),
});

export type State = {
  errors?: {
    userId?: string[];
    fojas?: string[];
    numero?: string[];
    anno?: string[];
    cbr?: string[];
    comuna?: string[];
    fechaEscritura?: string[];
    latitud?: string[];
    longitud?: string[];
    predio?: string[];
    vendedor?: string[];
    comprador?: string[];
    superficie?: string[];
    monto?: string[];
    rolAvaluo?: string[];
    observaciones?: string[];
  };
  message?: string | null;
};

export async function createReferencial(formData: FormData) {
  const validatedFields = ReferencialSchema.safeParse({
    userId: formData.get('userId'),
    fojas: Number(formData.get('fojas')),
    numero: Number(formData.get('numero')),
    anno: Number(formData.get('anno')),
    cbr: formData.get('cbr'),
    comuna: formData.get('comuna'),
    fechaEscritura: formData.get('fechaEscritura'),
    latitud: Number(formData.get('latitud')),
    longitud: Number(formData.get('longitud')),
    predio: formData.get('predio'),
    vendedor: formData.get('vendedor'),
    comprador: formData.get('comprador'),
    superficie: Number(formData.get('superficie')),
    monto: Number(formData.get('monto')),
    rolAvaluo: formData.get('rolAvaluo'),
    observaciones: formData.get('observaciones') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Referencial.',
    };
  }

  const { userId, fojas, numero, anno, cbr, comuna, fechaEscritura, latitud, longitud, predio, vendedor, comprador, superficie, monto, rolAvaluo, observaciones } = validatedFields.data;

  try {
    await prisma.referenciales.create({
      data: {
        userId,
        fojas,
        numero,
        anio: anno,
        cbr,
        comuna,
        fechaescritura: new Date(fechaEscritura),
        lat: latitud,
        lng: longitud,
        predio,
        vendedor,
        comprador,
        superficie,
        monto,
        rol: rolAvaluo,
        observaciones,
      },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to Create Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}

export async function updateReferencial(formData: FormData) {
  const validatedFields = ReferencialSchema.safeParse({
    userId: formData.get('userId'),
    fojas: Number(formData.get('fojas')),
    numero: Number(formData.get('numero')),
    anno: Number(formData.get('anno')),
    cbr: formData.get('cbr'),
    comuna: formData.get('comuna'),
    fechaEscritura: formData.get('fechaEscritura'),
    latitud: Number(formData.get('latitud')),
    longitud: Number(formData.get('longitud')),
    predio: formData.get('predio'),
    vendedor: formData.get('vendedor'),
    comprador: formData.get('comprador'),
    superficie: Number(formData.get('superficie')),
    monto: Number(formData.get('monto')),
    rolAvaluo: formData.get('rolAvaluo'),
    observaciones: formData.get('observaciones') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Referencial.',
    };
  }

  const { userId, fojas, numero, anno, cbr, comuna, fechaEscritura, latitud, longitud, predio, vendedor, comprador, superficie, monto, rolAvaluo, observaciones } = validatedFields.data;

  try {
    await prisma.referenciales.update({
      where: { id: formData.get('id') as string },
      data: {
        userId,
        fojas,
        numero,
        anio: anno,
        cbr,
        comuna,
        fechaescritura: new Date(fechaEscritura),
        lat: latitud,
        lng: longitud,
        predio,
        vendedor,
        comprador,
        superficie,
        monto,
        rol: rolAvaluo,
        observaciones,
      },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to Update Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}

export async function deleteReferencial(id: string) {
  try {
    await prisma.referenciales.delete({
      where: { id },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to Delete Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}