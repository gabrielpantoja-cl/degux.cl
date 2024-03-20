'use client';
import { referenciales } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateReferencial } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { UserCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

type FormState = {
  message: string | null;
  errors: {
    colaboradorId?: string[];
    amount?: string[];
  };
};

export default function EditReferencialForm({
  referencial,
  colaborador,
}: {
  referencial: referenciales;
  colaborador: any[];
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
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                defaultValue={referencial.monto}
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


        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/referenciales"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Edit Referencial</Button>
        </div>
      </div>
    </form>
  );
}