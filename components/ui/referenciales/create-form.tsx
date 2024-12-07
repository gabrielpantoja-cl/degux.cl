// components/ui/referenciales/create-form.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';
import { validateReferencial } from '@/lib/validation';
import { Input } from '@/components/ui/input';
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

const Form = () => (
  <SessionProvider>
    <InnerForm />
  </SessionProvider>
);

const InnerForm = () => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.email) {
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
      formData.set('userId', session?.user?.email || '');

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
            <input
              type="hidden"
              name="userId"
              value={session?.user?.email || ''}
              required
            />
          </div>
        )}

        <Input
          label="Fojas"
          id="fojas"
          name="fojas"
          type="number"
          placeholder="Escribe las fojas de la inscripción"
          error={state.errors.fojas}
          required={true}
        />

        <Input
          label="Número"
          id="numero"
          name="numero"
          type="number"
          placeholder="Escribe el número de la inscripción"
          error={state.errors.numero}
          required={true}
        />

        <Input
          label="Año"
          id="anno"
          name="anno"
          type="number"
          placeholder="Escribe el año de la inscripción"
          error={state.errors.anno}
          required={true}
        />

        <Input
          label="CBR"
          id="cbr"
          name="cbr"
          placeholder="Escribe el nombre del Conservador de Bienes Raíces"
          error={state.errors.cbr}
          required={true}
        />

        <Input
          label="Comuna"
          id="comuna"
          name="comuna"
          placeholder="Escribe el nombre de la comuna"
          error={state.errors.comuna}
          required={true}
        />

        <Input
          label="Rol de Avalúo"
          id="rolAvaluo"
          name="rolAvaluo"
          placeholder="Escribe el rol de avalúo de la propiedad"
          error={state.errors.rolAvaluo}
          required={true}
        />

        <Input
          label="Predio"
          id="predio"
          name="predio"
          placeholder="Escribe el nombre del predio"
          error={state.errors.predio}
          required={true}
        />

        <Input
          label="Vendedor"
          id="vendedor"
          name="vendedor"
          placeholder="Escribe el nombre del vendedor"
          error={state.errors.vendedor}
          required={true}
        />

        <Input
          label="Comprador"
          id="comprador"
          name="comprador"
          placeholder="Escribe el nombre del comprador"
          error={state.errors.comprador}
          required={true}
        />

        <Input
          label="Superficie"
          id="superficie"
          name="superficie"
          type="number"
          placeholder="Digita la superficie de la propiedad en m²"
          error={state.errors.superficie}
          required={true}
        />

        <Input
          label="Monto"
          id="monto"
          name="monto"
          type="number"
          placeholder="Digita el monto de la transacción en CLP"
          error={state.errors.monto}
          required={true}
        />

        <Input
          label="Fecha de escritura"
          id="fechaEscritura"
          name="fechaEscritura"
          type="date"
          placeholder="dd-mm-aaaa"
          pattern="\d{2}-\d{2}-\d{4}"
          error={state.errors.fechaEscritura}
          required={true}
        />

        <Input
          label="Latitud"
          id="latitud"
          name="latitud"
          type="number"
          placeholder="-39.851241"
          step="any"
          error={state.errors.latitud}
          required={true}
        />

        <Input
          label="Longitud"
          id="longitud"
          name="longitud"
          type="number"
          placeholder="-73.215171"
          step="any"
          error={state.errors.longitud}
          required={true}
        />

        <Input
          label="Observaciones"
          id="observaciones"
          name="observaciones"
          placeholder="Escribe observaciones como deslindes o número de plano"
          error={state.errors.observaciones}
        />

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