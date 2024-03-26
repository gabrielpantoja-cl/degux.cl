// app/ui/referenciales/edit-form.tsx
'use client';

import { referenciales } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateReferencial } from '@/app/lib/actions';
import { UserCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type FormState = {
  message: string | null;
  errors: {
    colaboradorId?: string[];
    monto?: string[];
  };
};

function useCustomFormState(
  action: (state: FormState) => Promise<FormState>,
  initialState: FormState
) {
  const [state, setState] = useState<FormState>(initialState);

  const dispatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newState = await action(formData);
    setState(newState);
  };

  return [state, dispatch] as const;
}

export default function EditReferencialForm({
  referencial,
  colaborador,
}: {
  referencial: referenciales;
  colaborador: any[];
}) {
  const initialState = { message: null, errors: {} };
  const updateReferencialWithId = updateReferencial.bind(null, referencial.id);
  const [state, dispatch] = useCustomFormState(updateReferencialWithId, initialState)

  return (
    <form onSubmit={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="colaborador" className="mb-2 block text-sm font-medium">
            Choose colaborador
          </label>
          <div className="relative">
            <select
              id="colaborador"
              name="colaboradorId"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={referencial.colaborador_id}
              aria-describedby="colaborador-error"
            >
              <option value="" disabled>
                Select a colaborador
              </option>
              {colaborador.map((colaborador: any) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.colaboradorId ? (
            <div
              id="colaborador-error"
              aria-live="polite"
              className="mt-2 text-sm text-red-500"
            >
              {state.errors.colaboradorId.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        {/* Referencial Monto */}
        <div className="mb-4">
          <label htmlFor="monto" className="mb-2 block text-sm font-medium">
            Elegir monto
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="monto"
                name="monto"
                type="number"
                defaultValue={referencial.monto}
                placeholder="Enter CLP monto"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="monto-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {state.errors?.monto ? (
            <div
              id="colaborador-error"
              aria-live="polite"
              className="mt-2 text-sm text-red-500"
            >
              {state.errors.monto.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
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
          <Button type="submit">Editar Referencial</Button>
        </div>
      </div>
    </form>
  );
}