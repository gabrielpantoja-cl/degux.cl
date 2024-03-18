'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

const ReferencialSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
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
    customerId?: string[];
    amount?: string[];
    // status?: string[];
  };
  message?: string | null;
};

export async function createReferencial(formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateReferencial.safeParse({
    customerId: formData.get('customerId'),
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

  // Prepare data for insertion into the database
  const { customerId, amount } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
        INSERT INTO referenciales (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Referencial.',
    };
  }

  // Revalidate the cache for the Referenciales page and redirect the user.
  revalidatePath('/dashboard/referenciales');
  redirect('/dashboard/referenciales');
}

// Use Zod to update the expected types
const UpdateReferencial = ReferencialSchema.omit({ id: true, date: true });

export async function updateReferencial(
  id: string,
  formData: FormData
) {
  // Validate form fields using Zod
  const validatedFields = UpdateReferencial.safeParse({
    customerId: formData.get('customerId'),
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
  const { customerId, amount } = validatedFields.data;
  const amountInCents = amount * 100;
  // Insert data into the database
  try {
    await sql`
      UPDATE referenciales
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Referencial.' };
  }
  // Revalidate the cache for the Referenciales page and redirect the user.
  revalidatePath('/dashboard/referenciales');
  redirect('/dashboard/referenciales');
}

export async function authenticate(
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'CredentialSignin';
    }
    throw error;
  }
}