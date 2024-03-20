'use client';

import { colaboradores, referenciales } from '@prisma/client';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateReferencial } from '@/app/lib/actions';
import { useFormState } from 'react-dom';

type FormState = {
  message: string | null;
  errors: {
    colaboradorId?: string[];
    amount?: string[];
    status?: string[];
  };
};

export default function EditReferencialForm({
  referencial,
  colaborador,
}: {
  referencial: referenciales;
  colaborador: [];
}) {
  const initialState = { message: null, errors: {} };
  const updateReferencialWithId = updateReferencial.bind(null, referencial.id);
  const [state, dispatch] = useFormState<FormState>(updateReferencialWithId, initialState);

  return (
    <form action={dispatch}>
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
              {colaborador.map((colaborador) => (
                <option key={colaboradores.id} value={colaboradores.id}>
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
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                defaultValue={referencial.amount}
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {state.errors?.amount ? (
            <div
              id="colaborador-error"
              aria-live="polite"
              className="mt-2 text-sm text-red-500"
            >
              {state.errors.amount.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        {/* Referencial Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the referencial status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={referencial.status === 'pending'}
                  className="h-4 w-4 border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-gray-600"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  defaultChecked={referencial.status === 'paid'}
                  className="h-4 w-4 border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-gray-600"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white dark:text-gray-300"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
        {state.errors?.status ? (
          <div
            id="status-error"
            aria-live="polite"
            className="mt-2 text-sm text-red-500"
          >
            {state.errors.status.map((error: string) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
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
        <Button type="submit">Edit Referencial</Button>
      </div>
    </form>
  );
}
