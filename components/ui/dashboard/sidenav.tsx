"use client";

import Link from 'next/link';
import NavLinks from '@/components/ui/dashboard/nav-links';
import AcmeLogo from '@/components/ui/acme-logo';
import { PowerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function SideNav() {
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
      console.error('Error during sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await fetch('/api/delete-account', {
        method: 'DELETE',
      });
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error during account deletion:', error);
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
          disabled={isLoading}
          className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-100 hover:text-blue-600'} 
            md:flex-none md:justify-start md:p-2 md:px-3`}
        >
          <PowerIcon className={`w-6 ${isLoading ? 'animate-pulse' : ''}`} />
          <div className="hidden md:block">{isLoading ? 'Saliendo...' : 'Cerrar Sesión'}</div>
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium 
            ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'} 
            md:flex-none md:justify-start md:p-2 md:px-3`}
        >
          <ExclamationTriangleIcon className={`w-6 ${isDeleting ? 'animate-pulse' : ''}`} />
          <div className="hidden md:block">{isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}</div>
        </button>
      </div>
    </div>
  );
}