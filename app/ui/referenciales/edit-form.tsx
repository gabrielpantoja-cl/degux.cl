// app/ui/referenciales/edit-form.tsx
'use client';

import { Prisma } from '@prisma/client';
import {
  //CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';

type ReferencialForm = Prisma.referencialesUncheckedCreateInput;
type ColaboradorField = Prisma.colaboradoresUncheckedCreateInput;

export default function EditReferencialForm({
  referencial,
  colaboradores,
}: {
  referencial: ReferencialForm;
  colaboradores: ColaboradorField[];
}) {
  return (
    <form>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Colaborador Name */}
        <div className="mb-4">
          <label htmlFor="colaborador" className="mb-2 block text-sm font-medium">
            Elige colaborador
          </label>
          <div className="relative">
            <select
              id="colaborador"
              name="colaboradorId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={referencial.colaborador_id}
            >
              <option value="" disabled>
                Select a colaborador
              </option>
              {Array.isArray(colaboradores) && colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Referencial Monto */}
        <div className="mb-4">
          <label htmlFor="fojas" className="mb-2 block text-sm font-medium">
            Fojas
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="fojas"
                name="fojas"
                type="number"
                defaultValue={referencial.fojas} // Asumiendo que 'referencial' es el objeto que contiene los datos actuales
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ingrese el número de fojas"
              />
            </div>
          </div>
        </div>
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