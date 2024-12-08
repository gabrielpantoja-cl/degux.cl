// components/ui/referenciales/create-form.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';
import { validateReferencial } from '@/lib/validation';
import FormFields from './FormFields';
import { ValidationResult } from '@/types/types';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
}

interface FormProps {
  users: { id: string; name: string | null }[];
}

const Form = ({ users }: FormProps) => (
  <SessionProvider>
    <InnerForm users={users} />
  </SessionProvider>
);

const InnerForm = ({ users }: FormProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [state, setState] = useState<FormState>({
    message: null,
    messageType: null,
    errors: {},
    invalidFields: new Set(),
    isSubmitting: false
  });

  useEffect(() => {
    if (session?.user?.email) {
      console.log('Sesión detectada:', {
        email: session.user.email,
        name: session.user.name
      });
    }
  }, [session]);

  const userId = session?.user?.id;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setState({
        ...state,
        message: "Error: Usuario no autenticado",
        messageType: 'error',
        errors: { auth: ['Se requiere autenticación'] }
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, message: null }));

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('userId', userId);

      const validationResult: ValidationResult = validateReferencial(formData);

      if (!validationResult.isValid) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: validationResult.errors,
          message: validationResult.message || "Por favor complete todos los campos requeridos",
          messageType: 'error',
          invalidFields: new Set(Object.keys(validationResult.errors))
        }));
        return;
      }

      const result = await createReferencial(formData);

      if (result?.errors) {
        setState({
          errors: result.errors,
          message: "Error al crear el referencial: " + (result.message || Object.values(result.errors).flat().join(', ')),
          messageType: 'error',
          invalidFields: new Set(Object.keys(result.errors)),
          isSubmitting: false
        });
        return;
      }

      if ('success' in result && result.success) {
        setState({
          ...state,
          message: result.message || "¡Referencial creado exitosamente!",
          messageType: 'success'
        });

        setTimeout(() => {
          router.push('/dashboard/referenciales');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error desconocido al crear el referencial');
      }
    } catch (error) {
      console.error('Error al crear el referencial:', error);
      setState({
        ...state,
        message: error instanceof Error
          ? `Error al crear el referencial: ${error.message}`
          : "Error inesperado al procesar el formulario. Por favor, revise la consola para más detalles.",
        messageType: 'error'
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {session?.user && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">
              Usuario: {session.user.name}
            </p>
            <p className="mb-2 text-sm font-medium">
              ID: {session.user.id}
            </p>
            <input
              type="hidden"
              name="userId"
              value={userId || ''}
              required
            />
          </div>
        )}

        <FormFields state={state} />

        {state.message && (
          <div
            id="message"
            aria-live="polite"
            className={`mt-2 text-sm ${state.messageType === 'error'
              ? 'text-red-500'
              : 'text-green-500'
              }`}
          >
            <p>{state.message}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/referenciales"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={state.isSubmitting}
        >
          {state.isSubmitting ? 'Creando...' : 'Crear Referencial'}
        </Button>
      </div>
    </form>
  );
};

export default Form;