'use client';
import React from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useFormState } from 'react-dom';
import { useSession, SessionProvider } from 'next-auth/react';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
}

const InputField: React.FC<{
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder: string;
  error?: string[];
}> = ({ label, id, name, type = "text", placeholder, error }) => (
  <div className="mb-4">
    <label htmlFor={id} className="mb-2 block text-sm font-medium">
      {label}
    </label>
    <div className="relative mt-2 rounded-md">
      <input
        id={id}
        name={name}
        type={type}
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
  const { data: session } = useSession();
  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<FormState>(() => createReferencial(new FormData()), initialState);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch();
      }}
    >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Colaborador (Usuario autenticado) */}
        {session?.user && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">
              Colaborador: {session.user.name}
            </p>
            <input type="hidden" name="colaboradorId" value={session.user.id} />
          </div>
        )}

        <InputField
          label="Fojas"
          id="fojas"
          name="fojas"
          type="number"
          placeholder="Escribe las fojas de la inscripción"
          error={state.errors.fojas}
        />

        <InputField
          label="Número"
          id="numero"
          name="numero"
          type="number"
          placeholder="Escribe el número de la inscripción"
          error={state.errors.numero}
        />

        <InputField
          label="Año"
          id="anno"
          name="anno"
          type="number"
          placeholder="Escribe el año de la inscripción"
          error={state.errors.anno}
        />

        <InputField
          label="CBR"
          id="cbr"
          name="cbr"
          placeholder="Escribe el nombre del Conservador de Bienes Raíces"
          error={state.errors.cbr}
        />

        <InputField
          label="Comuna"
          id="comuna"
          name="comuna"
          placeholder="Escribe el nombre de la comuna"
          error={state.errors.comuna}
        />

        <InputField
          label="Rol de Avalúo"
          id="rolAvaluo"
          name="rolAvaluo"
          placeholder="Escribe el rol de avalúo de la propiedad"
          error={state.errors.rolAvaluo}
        />

        <InputField
          label="Predio"
          id="predio"
          name="predio"
          placeholder="Escribe el nombre del predio"
          error={state.errors.predio}
        />

        <InputField
          label="Vendedor"
          id="vendedor"
          name="vendedor"
          placeholder="Escribe el nombre del vendedor"
          error={state.errors.vendedor}
        />

        <InputField
          label="Comprador"
          id="comprador"
          name="comprador"
          placeholder="Escribe el nombre del comprador"
          error={state.errors.comprador}
        />

        <InputField
          label="Superficie"
          id="superficie"
          name="superficie"
          type="number"
          placeholder="Digita la superficie de la propiedad en m²"
          error={state.errors.superficie}
        />

        <InputField
          label="Monto"
          id="monto"
          name="monto"
          type="number"
          placeholder="Digita el monto de la transacción en CLP"
          error={state.errors.monto}
        />

        <InputField
          label="Fecha de escritura"
          id="fechaEscritura"
          name="fechaEscritura"
          placeholder="Escribe la fecha de escritura dd-mm-aaaa"
          error={state.errors.fechaEscritura}
        />

        <InputField
          label="Latitud"
          id="latitud"
          name="latitud"
          type="number"
          placeholder="-39.851241"
          error={state.errors.latitud}
        />

        <InputField
          label="Longitud"
          id="longitud"
          name="longitud"
          type="number"
          placeholder="-73.215171"
          error={state.errors.longitud}
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
        <Button type="submit">Crear Referencial</Button>
      </div>
    </form>
  );
};

export default Form;