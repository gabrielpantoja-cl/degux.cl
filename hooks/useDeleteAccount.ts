// hooks/useDeleteAccount.ts
import { useState } from 'react';
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

  const deleteAccount = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para eliminar tu cuenta');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      toast.loading('Eliminando cuenta...');

      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data: DeleteAccountResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }

      toast.dismiss();
      toast.success(data.message || 'Cuenta eliminada correctamente');
      await signOut({ callbackUrl: '/', redirect: true });

    } catch (error) {
      console.error('Error durante la eliminación de cuenta:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting
  };
};