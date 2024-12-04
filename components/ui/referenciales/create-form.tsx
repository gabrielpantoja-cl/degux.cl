// components/ui/referenciales/create-form.tsx
'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
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

// Componente Form wrapper simplificado
const Form: React.FC = () => (
  <SessionProvider>
    <InnerForm />
  </SessionProvider>
);

// Componente InnerForm corregido
const InnerForm: React.FC = (): ReactNode => {
  const router = useRouter();
  const { data: session } = useSession();


  // 1. Crear un estado local para el userId
  const [userId, setUserId] = useState<string>('');


  // 2. Efecto para establecer el userId cuando la sesión esté disponible
  useEffect(() => {
    if (session?.user?.email) {
      setUserId(session.user.email); // Usar email como ID temporal
    }
  }, [session]);


  // Debugging session
  console.log('Session completa:', session);
  console.log('User ID:', session?.user?.id);
  const initialState: FormState = {
    message: null,
    messageType: null,
    errors: {},
    invalidFields: new Set(),
    isSubmitting: false
  };

  const [state, setState] = useState<FormState>(initialState);

  // Modificar la función validateForm para mejor logging del userId
  const validateForm = (formData: FormData): boolean => {
    const errors: { [key: string]: string[] } = {};
    const userId = formData.get('userId');

    console.log('Validando userId:', userId);
    console.log('Session en validateForm:', session);

    if (!userId) {
      console.error('Usuario no autenticado. Session:', session);
      errors['userId'] = ['Usuario no autenticado'];
      setState(prev => ({
        ...prev,
        errors,
        message: 'Se requiere autenticación',
        messageType: 'error'
      }));
      return false;
    }


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

    // Validación de sesión
    if (!session?.user?.email) {
      setState({
        ...initialState,
        message: "Error: No hay una sesión de usuario activa. Por favor, inicie sesión nuevamente.",
        messageType: 'error',
        errors: {
          userId: ['Usuario no autenticado']
        }
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, message: null }));

    try {
      const formData = new FormData(e.currentTarget);

      // Asegurar que el userId está presente
      if (!formData.get('userId')) {
        formData.set('userId', session?.user?.email || '');
      }
      // Log detallado antes de enviar
      console.log('Datos a enviar:', {
        userId: formData.get('userId'),
        fojas: formData.get('fojas'),
        numero: formData.get('numero'),
        anno: formData.get('anno'),
        // ... otros campos
      });

      // Log más detallado
      console.log('Session:', session);
      console.log('UserId:', formData.get('userId'));
      console.log('Datos completos:', Object.fromEntries(formData));


      if (!validateForm(formData)) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          message: "Por favor complete todos los campos requeridos",
          messageType: 'error'
        }));
        return;
      }

      // Validaciones adicionales de formato
      const latitud = parseFloat(formData.get('latitud') as string);
      const longitud = parseFloat(formData.get('longitud') as string);
      const superficie = parseFloat(formData.get('superficie') as string);
      const monto = parseFloat(formData.get('monto') as string);

      // Validar coordenadas
      if (isNaN(latitud) || isNaN(longitud)) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          message: "Las coordenadas deben ser números válidos",
          messageType: 'error',
          errors: {
            ...prev.errors,
            latitud: isNaN(latitud) ? ['Latitud inválida'] : [],
            longitud: isNaN(longitud) ? ['Longitud inválida'] : []
          }
        }));
        return;
      }

      // Validar superficie y monto
      if (isNaN(superficie) || superficie <= 0) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          message: "La superficie debe ser un número positivo",
          messageType: 'error',
          errors: {
            ...prev.errors,
            superficie: ['Superficie inválida']
          }
        }));
        return;
      }

      if (isNaN(monto) || monto <= 0) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          message: "El monto debe ser un número positivo",
          messageType: 'error',
          errors: {
            ...prev.errors,
            monto: ['Monto inválido']
          }
        }));
        return;
      }
      const result = await createReferencial(formData);

      // Log detallado de la respuesta
      console.log('Respuesta del servidor:', result);


      if (result?.errors) {
        console.error('Errores del servidor:', result.errors);
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
          ...initialState,
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
      console.error('Error detallado:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      setState({
        ...initialState,
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
              value={session?.user?.email || ''} // Usar directamente el email de la sesión
              required
            />
            {/* Debug info */}
            <p className="text-xs text-gray-500">
              Email (ID temporal): {userId}
            </p>
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