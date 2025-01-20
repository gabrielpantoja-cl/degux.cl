// __tests__/useSignOutComponent.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/', redirect: true });
    } catch {
      toast.error('No se pudo cerrar la sesión. Por favor, intenta nuevamente.');
    }
  };


  return (
    <button onClick={handleSignOut}>
      Cerrar Sesión
    </button>
  );
};

describe('SignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería cerrar sesión y redireccionar correctamente', async () => {
    const { getByText } = render(<SignOutButton />);

    fireEvent.click(getByText('Cerrar Sesión'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/',
        redirect: true,
      });
    });
  });

  it('debería manejar error al cerrar sesión', async () => {
    (signOut as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Error al cerrar sesión');
    });

    const { getByText } = render(<SignOutButton />);

    fireEvent.click(getByText('Cerrar Sesión'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo cerrar la sesión. Por favor, intenta nuevamente.'
      );
    });
  });
});