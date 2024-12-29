// components/ui/dashboard/sidenav.tsx
"use client";

import Link from 'next/link';
import NavLinks from '@/components/ui/dashboard/nav-links';
import AcmeLogo from '@/components/ui/acme-logo';
import { PowerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';

export default function SideNav() {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    deleteAccount, 
    isDeleting, 
    showModal, 
    setShowModal, 
    handleConfirmDelete 
  } = useDeleteAccount();

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

  return (
    <>
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
            onClick={deleteAccount}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">¿Estás seguro?</h3>
            <p className="mb-6 text-sm text-gray-600">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}