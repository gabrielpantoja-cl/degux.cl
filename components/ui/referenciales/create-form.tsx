// components/ui/referenciales/create-form.tsx
'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';
import { validateReferencial } from '@/lib/validation';
import FormFields from './FormFields';
import { ValidationResult } from '@/types/types';

interface FormState {
  errors: { [key: string]: string[] };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
  redirecting: boolean;
}

interface User {
  id: string;
  name: string | null;
}

interface FormProps {
  users: User[];
}

const Form: React.FC<FormProps> = ({ users }) => (
  <SessionProvider>
    <InnerForm users={users} />
  </SessionProvider>
);

const InnerForm: React.FC<FormProps> = ({ users }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const mounted = useRef(true);
  const [isCreated, setIsCreated] = useState(false);
  
  const [state, setState] = useState<FormState>({
    message: null,
    messageType: null,
    errors: {},
    invalidFields: new Set(),
    isSubmitting: false,
    redirecting: false
  });
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const userId = session?.user?.id;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setState(prev => ({
        ...prev,
        message: "Error: Usuario no autenticado",
        messageType: 'error',
        errors: { auth: ['Se requiere autenticación'] }
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isSubmitting: true, 
      message: "Procesando solicitud...",
      messageType: 'success',
      errors: {},
      invalidFields: new Set()
    }));

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

      if (!mounted.current) return;

      if (result?.errors) {
        setState(prev => ({
          ...prev,
          errors: result.errors,
          message: "Error al crear el referencial: " + (result.message || Object.values(result.errors).flat().join(', ')),
          messageType: 'error',
          invalidFields: new Set(Object.keys(result.errors)),
          isSubmitting: false
        }));
        return;
      }

      if ('success' in result && result.success) {
        setIsCreated(true);
        setState(prev => ({
          ...prev,
          message: "¡Referencial creado exitosamente! Redirigiendo...",
          messageType: 'success',
          isSubmitting: false,
          redirecting: true
        }));

        const redirectTimeout = setTimeout(() => {
          if (mounted.current) {
            router.push('/dashboard/referenciales');
            router.refresh(); // Forzar actualización de la página
          }
        }, 2000);

        return () => clearTimeout(redirectTimeout);
      } else {
        throw new Error(result.message || 'Error desconocido al crear el referencial');
      }
    } catch (error) {
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          message: error instanceof Error
            ? `Error al crear el referencial: ${error.message}`
            : "Error inesperado al procesar el formulario",
          messageType: 'error',
          isSubmitting: false
        }));
      }
    }
  };

  const currentUser = useMemo(() => ({
    id: session?.user?.id || '',
    name: session?.user?.name || ''
  }), [session?.user?.id, session?.user?.name]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormFields state={state} currentUser={currentUser} />

        {state.message && (
          <div
            id="message"
            aria-live="polite"
            className={`mt-2 text-sm ${
              state.messageType === 'error' ? 'text-red-500' : 'text-green-500'
            }`}
          >
            <p>{state.message}</p>
          </div>
        )}

        {isCreated && (
          <div className="mt-2 text-sm text-green-500">
            ¡Referencial creado exitosamente!
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-lg font-medium">Usuarios conectados</h3>
          <p>{users.length} usuarios conectados</p>
        </div>
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
          disabled={state.isSubmitting || state.redirecting}
        >
          {state.isSubmitting 
            ? 'Creando...' 
            : state.redirecting 
              ? 'Redirigiendo...' 
              : 'Crear Referencial'
          }
        </Button>
      </div>
    </form>
  );
};

export default Form;