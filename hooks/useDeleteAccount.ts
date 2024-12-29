// hooks/useDeleteAccount.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface DeleteAccountResponse {
  message: string;
  success: boolean;
  error?: string;
}

interface FetchConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG: FetchConfig = {
  timeout: 8000,    // 8 segundos
  retries: 3,       // 3 intentos
  retryDelay: 1000  // 1 segundo entre intentos
};

export const useDeleteAccount = () => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const fetchWithRetry = async (url: string, options: RequestInit, config: FetchConfig = DEFAULT_CONFIG) => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < (config.retries || 1); attempt++) {
      try {
        abortController.current = new AbortController();
        
        const timeoutId = setTimeout(() => {
          abortController.current?.abort();
        }, config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: abortController.current.signal
        });

        clearTimeout(timeoutId);

        // Verificar si la ruta existe
        if (response.status === 404) {
          throw new Error('La ruta del API no está disponible. Por favor, verifica la configuración.');
        }

        return response;

      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('La operación excedió el tiempo límite.');
        }

        if (attempt < (config.retries || 1) - 1) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay));
          continue;
        }
      }
    }

    throw lastError || new Error('Error en la petición después de varios intentos');
  };

  const handleConfirmDelete = useCallback(async () => {
    const toastId = toast.loading('Eliminando cuenta...');

    try {
      setIsDeleting(true);

      const response = await fetchWithRetry('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('El servidor no envió respuesta');
      }

      let data: DeleteAccountResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error al parsear respuesta:', responseText);
        throw new Error('Respuesta del servidor inválida');
      }

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${data.message || 'Error desconocido'}`);
      }

      toast.success(data.message || 'Cuenta eliminada correctamente', {
        id: toastId
      });

      await signOut({ callbackUrl: '/', redirect: true });

    } catch (error) {
      console.error('Error durante la eliminación de cuenta:', error);
      
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al eliminar la cuenta. Por favor, intenta nuevamente.',
        { id: toastId }
      );
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  }, []);

  const deleteAccount = () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para eliminar tu cuenta');
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