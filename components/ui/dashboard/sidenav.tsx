// components/ui/dashboard/sidenav.tsx
"use client";

import Link from 'next/link';
import NavLinks from '@/components/ui/dashboard/nav-links';
import AcmeLogo from '@/components/ui/acme-logo';
import { PowerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SideNav() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para eliminar tu cuenta');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar la cuenta');
      }

      toast.success('Cuenta eliminada correctamente');
      
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error durante la eliminación de cuenta:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <button
          onClick={handleSignOut}
          disabled={isLoading || isDeleting}
          aria-label={isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium 
            ${(isLoading || isDeleting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-100 hover:text-blue-600'} 
            md:flex-none md:justify-start md:p-2 md:px-3`}
        >
          <PowerIcon className={`w-6 ${isLoading ? 'animate-pulse' : ''}`} />
          <div className="hidden md:block">{isLoading ? 'Saliendo...' : 'Cerrar Sesión'}</div>
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting || isLoading}
          aria-label={isDeleting ? 'Eliminando cuenta...' : 'Eliminar cuenta'}
          className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium 
            ${(isDeleting || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'} 
            md:flex-none md:justify-start md:p-2 md:px-3`}
        >
          <ExclamationTriangleIcon className={`w-6 ${isDeleting ? 'animate-pulse' : ''}`} />
          <div className="hidden md:block">{isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}</div>
        </button>
      </div>
    </div>
  );
}