// components/ui/referenciales/create-form.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🆕 Importar router
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
  invalidFields: Set<string>;
  isSubmitting: boolean; // 🆕 Nuevo estado

}

const REQUIRED_FIELDS = [
  'fojas',
  'numero',
  'anno',
  'cbr',
  'comuna',
  'fechaEscritura',
  'latitud',
  'longitud',
  'predio',
  'vendedor',
  'comprador',
  'superficie',
  'monto',
  'rolAvaluo'
];

const InputField: React.FC<{
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder: string;
  error?: string[];
  step?: string;
  required?: boolean;
  pattern?: string;
}> = ({ label, id, name, type = "text", placeholder, error, step }) => (
  <div className="mb-4">
    <label htmlFor={id} className="mb-2 block text-sm font-medium">
      {label}
    </label>
    <div className="relative mt-2 rounded-md">
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
        aria-describedby={`${id}-error`}
      />
    </div>
    {error && (
      <div
        id={`${id}-error`}
        aria-live="polite"
        className="mt-2 text-sm text-red-500"
      >
        {error.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>
    )}
  </div>
);

const Form: React.FC = () => (
  <SessionProvider>
    <InnerForm />
  </SessionProvider>
);

const InnerForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const initialState: FormState = {
    message: null,
    errors: {},
    invalidFields: new Set(),
    isSubmitting: false
  };
  const [state, setState] = useState<FormState>(initialState);

  const validateForm = (formData: FormData): boolean => {
    const errors: { [key: string]: string[] } = {};

    REQUIRED_FIELDS.forEach(field => {
      if (!formData.get(field)) {
        errors[field] = ['Este campo es requerido'];
      }
    });

    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        errors,
        message: 'Por favor complete todos los campos requeridos',
        invalidFields: new Set(Object.keys(errors))
      }));
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);

      if (!validateForm(formData)) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      const result = await createReferencial(formData);

      if (result?.errors) {
        setState({
          errors: result.errors,
          message: "Por favor corrija los errores marcados",
          invalidFields: new Set(Object.keys(result.errors)),
          isSubmitting: false
        });
      } else {
        setState({
          ...initialState,
          message: "¡Referencial creado exitosamente!"
        });

        setTimeout(() => {
          router.push('/dashboard/referenciales');
        }, 2000);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      setState({
        ...initialState,
        message: error instanceof Error
          ? `Error: ${error.message}`
          : "Error inesperado al procesar el formulario",
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Usuario autenticado */}
        {session?.user && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">
              Usuario: {session.user.name}
            </p>
            <input type="hidden" name="userId" value={session.user.id} />
          </div>
        )}

        <InputField
          label="Fojas"
          id="fojas"
          name="fojas"
          type="number"
          placeholder="Escribe las fojas de la inscripción"
          error={state.errors.fojas}
          required={true}
        />

        <InputField
          label="Número"
          id="numero"
          name="numero"
          type="number"
          placeholder="Escribe el número de la inscripción"
          error={state.errors.numero}
          required={true}
        />

        <InputField
          label="Año"
          id="anno"
          name="anno"
          type="number"
          placeholder="Escribe el año de la inscripción"
          error={state.errors.anno}
          required={true}
        />

        <InputField
          label="CBR"
          id="cbr"
          name="cbr"
          placeholder="Escribe el nombre del Conservador de Bienes Raíces"
          error={state.errors.cbr}
          required={true}
        />

        <InputField
          label="Comuna"
          id="comuna"
          name="comuna"
          placeholder="Escribe el nombre de la comuna"
          error={state.errors.comuna}
          required={true}
        />

        <InputField
          label="Rol de Avalúo"
          id="rolAvaluo"
          name="rolAvaluo"
          placeholder="Escribe el rol de avalúo de la propiedad"
          error={state.errors.rolAvaluo}
          required={true}

        />

        <InputField
          label="Predio"
          id="predio"
          name="predio"
          placeholder="Escribe el nombre del predio"
          error={state.errors.predio}
          required={true}

        />

        <InputField
          label="Vendedor"
          id="vendedor"
          name="vendedor"
          placeholder="Escribe el nombre del vendedor"
          error={state.errors.vendedor}
          required={true}

        />

        <InputField
          label="Comprador"
          id="comprador"
          name="comprador"
          placeholder="Escribe el nombre del comprador"
          error={state.errors.comprador}
          required={true}

        />

        <InputField
          label="Superficie"
          id="superficie"
          name="superficie"
          type="number"
          placeholder="Digita la superficie de la propiedad en m²"
          error={state.errors.superficie}
          required={true}

        />

        <InputField
          label="Monto"
          id="monto"
          name="monto"
          type="number"
          placeholder="Digita el monto de la transacción en CLP"
          error={state.errors.monto}
          required={true}

        />

        <InputField
          label="Fecha de escritura"
          id="fechaEscritura"
          name="fechaEscritura"
          type="date" 
          placeholder="dd-mm-aaaa"
          pattern="\d{2}-\d{2}-\d{4}" 
          error={state.errors.fechaEscritura}
          required={true}

        />

        <InputField
          label="Latitud"
          id="latitud"
          name="latitud"
          type="number"
          placeholder="-39.851241"
          step="any"
          error={state.errors.latitud}
          required={true}

        />

        <InputField
          label="Longitud"
          id="longitud"
          name="longitud"
          type="number"
          placeholder="-73.215171"
          step="any"
          error={state.errors.longitud}
          required={true}

        />

        <InputField
          label="Observaciones"
          id="observaciones"
          name="observaciones"
          placeholder="Escribe observaciones como deslindes o número de plano"
          error={state.errors.observaciones}
        />

        {state.message && (
          <div
            id="message-error"
            aria-live="polite"
            className="mt-2 text-sm text-red-500"
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
        </Button>      </div>
    </form>
  );
};

export default Form;