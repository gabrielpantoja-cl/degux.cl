// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { prisma } from '@/lib/prisma'; 

const ReferencialSchema = z.object({
  id: z.string(),
  colaboradorId: z.string({
    invalid_type_error: 'Please select a colaborador.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),

  date: z.string(),
});

const CreateReferencial = ReferencialSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    colaboradorId?: string[];
    amount?: string[];
  };
  message?: string | null;
};

export async function createReferencial(formData: FormData) {
  const validatedFields = CreateReferencial.safeParse({
    colaboradorId: formData.get('colaboradorId'),
    amount: formData.get('amount'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Referencial.',
    };
  }

  // Revalidate the cache for the Referenciales page and redirect the user.
  revalidatePath('/dashboard/referenciales');
  redirect('/dashboard/referenciales');
}

const UpdateReferencial = ReferencialSchema.omit({ id: true, date: true });

export async function updateReferencial(formData: FormData) {
  const validatedFields = UpdateReferencial.safeParse({
    colaboradorId: formData.get('colaboradorId'),
    amount: formData.get('amount'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Referencial.',
    };
  }

  const { colaboradorId, amount } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await prisma.referenciales.create({
      data: {
        colaborador_id: colaboradorId,
        monto: amountInCents,
        fechaescritura: new Date(),
        lat: 0, // replace with actual value
        lng: 0, // replace with actual value
        fojas: 0, // replace with actual value
        numero: 0, // replace with actual value
        anio: 0, // replace with actual value
        comuna: '', // replace with actual value
        cbr: '', // replace with actual value
        comprador: '', // replace with actual value
        vendedor: '', // replace with actual value
        predio: '', // replace with actual value
        rol: '', // replace with actual value
        superficie: 0, // replace with actual value
        observaciones: '', // replace with actual value
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Referencial.',
    };
  }
}

export async function authenticate() {
  try {
    await signIn('google');
  } catch (error) {
    console.error('Error during sign-in:', error);
    return 'SignInError';
  }
}