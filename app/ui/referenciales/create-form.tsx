// app/ui/referenciales/create-form.tsx

'use client';

import Link from 'next/link';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createReferencial } from '@/app/lib/actions';
import { useFormState } from 'react-dom';

interface FormState {
  errors: {
    colaboradorId?: string[];
    monto?: string[];
  };
  message: string | null;
}

// Define las propiedades del componente Form
interface FormProps {
  colaboradores: { id: string; name: string; }[];
}

const Form: React.FC<FormProps> = ({ colaboradores }) => {

  const initialState: FormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<FormState>(() => createReferencial(new FormData()), initialState);

  // Utiliza colaboradores, state y dispatch en tu componente
  // ...

  return (
    <form onSubmit={(e) => { e.preventDefault(); dispatch(); }}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* Referencial Monto */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {state.errors?.monto ? (
            <div
              id="amount-error"
              aria-live="polite"
              className="mt-2 text-sm text-red-500"
            >
              {state.errors.monto.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        {state.message ? (
          <div
            id="message-error"
            aria-live="polite"
            className="mt-2 text-sm text-red-500"
          >
            <p key={state.message}>{state.message}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/referenciales"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Crear Referencial</Button>
      </div>
    </form>
  );
}

export default Form;