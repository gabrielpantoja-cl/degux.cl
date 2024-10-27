// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { prisma } from '@/lib/prisma'; // Importa la instancia única de PrismaClient

const ReferencialSchema = z.object({
  id: z.string(),
  colaboradorId: z.string({
    invalid_type_error: 'Please select a colaborador.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  // status: z.enum(['pending', 'paid'], {
  //   invalid_type_error: 'Please select an referencial status.',
  // }),
  date: z.string(),
});

const CreateReferencial = ReferencialSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    colaboradorId?: string[];
    amount?: string[];
    // status?: string[];
  };
  message?: string | null;
};

export async function createReferencial(formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateReferencial.safeParse({
    colaboradorId: formData.get('colaboradorId'),
    amount: formData.get('amount'),
    // status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
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

// Use Zod to update the expected types
const UpdateReferencial = ReferencialSchema.omit({ id: true, date: true });

export async function updateReferencial(formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = UpdateReferencial.safeParse({
    colaboradorId: formData.get('colaboradorId'),
    amount: formData.get('amount'),
    // status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Referencial.',
    };
  }

  // Prepare data for insertion into the database
  const { colaboradorId, amount } = validatedFields.data;
  const amountInCents = amount * 100;
  // Insert data into the database
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