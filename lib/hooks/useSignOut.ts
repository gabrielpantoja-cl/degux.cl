// lib/hooks/useSignOut.ts
import { useState } from 'react';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export const useSignOut = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Cerrar sesión con NextAuth
      await nextAuthSignOut({
        callbackUrl: '/',
        redirect: true,
      });

      // Guardar mensaje para mostrar en la página de inicio
      localStorage.setItem('signOutMessage', '👋 ¡Hasta pronto! Sesión cerrada exitosamente');
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('No se pudo cerrar la sesión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
};