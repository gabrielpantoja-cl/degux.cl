// hooks/useDeleteAccount.ts
import { useState, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface DeleteAccountResponse {
  message: string;
  success: boolean;
  error?: string;
}

export const useDeleteAccount = () => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    const toastId = toast.loading('Eliminando cuenta...');

    try {
      setIsDeleting(true);

      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data: DeleteAccountResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${data.message || 'Error desconocido'}`);
      }

      if (!data.success && data.message.includes('registros asociados')) {
        toast.error(data.message, {
          id: toastId,
          duration: 7000 // Duración de 7 segundos
        });
        setShowModal(false);
        return;
      }

      toast.success(data.message || 'Cuenta eliminada correctamente', {
        id: toastId,
        duration: 7000 // Duración de 7 segundos
      });

      await signOut({ callbackUrl: '/', redirect: true });

    } catch (error) {
      console.error('Error durante la eliminación de cuenta:', error);
      
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al eliminar la cuenta. Por favor, intenta nuevamente.',
        { id: toastId, duration: 7000 } // Duración de 7 segundos
      );
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  }, [session]);

  const deleteAccount = () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para eliminar tu cuenta', { duration: 7000 }); // Duración de 7 segundos
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