// components/ui/referenciales/edit-form.tsx
'use client';

import React, { useState } from 'react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import FormFields from './FormFields';
import { updateReferencial, deleteReferencial } from '@/lib/actions'; // Asegúrate de tener esta función implementada
import { useSession } from 'next-auth/react';

type ReferencialForm = Prisma.referencialesUncheckedCreateInput & { id: string };

export default function EditReferencialForm({
  referencial,
  users,
}: {
  referencial: ReferencialForm;
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [formState, setFormState] = useState({
    userId: referencial.userId,
    fojas: referencial.fojas,
    numero: referencial.numero,
    anio: referencial.anio,
    cbr: referencial.cbr,
    comuna: referencial.comuna,
    rol: referencial.rol,
    predio: referencial.predio,
    vendedor: referencial.vendedor,
    comprador: referencial.comprador,
    superficie: referencial.superficie,
    monto: referencial.monto,
    fechaescritura: referencial.fechaescritura,
    lat: referencial.lat,
    lng: referencial.lng,
    observaciones: referencial.observaciones,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        formData.append(key, value as string | Blob);
      });
      await updateReferencial(formData);
      router.push('/dashboard/referenciales');
      router.refresh(); // Forzar actualización de la página
    } catch (error) {
      console.error('Error al actualizar el referencial:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este referencial? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      if (referencial.id) {
        await deleteReferencial(referencial.id);
        router.push('/dashboard/referenciales');
        router.refresh(); // Forzar actualización de la página
      } else {
        console.error('Error: Referencial ID is undefined');
      }
    } catch (error) {
      console.error('Error al eliminar el referencial:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Usuario Name */}
        <div className="mb-4">
          <label htmlFor="user" className="mb-2 block text-sm font-medium">
            Elige usuario
          </label>
          <div className="relative">
            <select
              id="user"
              name="userId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={formState.userId}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Fields */}
        <FormFields state={{ errors: {}, message: null, messageType: null, invalidFields: new Set(), isSubmitting: false }} currentUser={{ id: formState.userId, name: users.find(user => user.id === formState.userId)?.name || '' }} />

        {/* Additional Fields */}
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
                value={formState.fojas}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ingrese el número de fojas"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between gap-4">
        <Link
          href="/dashboard/referenciales"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <div className="flex gap-4">
          {session?.user?.email === 'gabrielpantojarivera@gmail.com' && (
            <Button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Eliminar Referencial
            </Button>
          )}
          <Button type="submit">Editar Referencial</Button>
        </div>
      </div>
    </form>
  );
}