// lib/hooks/useDeleteAccount.ts
import { useState, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export const useDeleteAccount = () => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!session?.user) {
      toast.error('Sesión no válida');
      return;
    }

    const toastId = toast.loading('Eliminando cuenta...');
    
    try {
      setIsDeleting(true);
      
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }

      toast.success('Cuenta eliminada correctamente', { id: toastId });
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la cuenta', { id: toastId });
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  }, [session]);

  const deleteAccount = () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión');
      return;
    }
    setShowModal(true);
  };

  return {
    deleteAccount,
    isDeleting,
    showModal,
    setShowModal,
    handleConfirmDelete
  };
};