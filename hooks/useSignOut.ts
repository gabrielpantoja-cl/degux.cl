// hooks/useSignOut.ts
import { useState } from 'react';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export const useSignOut = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    try {
      setIsLoading(true);
      localStorage.setItem('signOutMessage', 'Sesión cerrada exitosamente');
      await nextAuthSignOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      toast.error('Error al cerrar sesión');
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
};