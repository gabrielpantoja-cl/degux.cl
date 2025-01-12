// __tests__/useSignOutComponent.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useSignOut } from '../lib/hooks/useSignOut';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const SignOutComponent = () => {
  const { signOut, isLoading } = useSignOut();

  return (
    <button onClick={signOut} disabled={isLoading}>
      Sign Out
    </button>
  );
};

describe('useSignOut', () => {
  it('should sign out and redirect correctly', async () => {
    const { getByText } = render(<SignOutComponent />);

    fireEvent.click(getByText('Sign Out'));

    await waitFor(() => {
      expect(nextAuthSignOut).toHaveBeenCalledWith({
        callbackUrl: '/',
        redirect: true,
      });
      expect(localStorage.getItem('signOutMessage')).toBe('👋 ¡Hasta pronto! Sesión cerrada exitosamente');
    });
  });

  it('should handle sign out error', async () => {
    (nextAuthSignOut as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Sign out error');
    });

    const { getByText } = render(<SignOutComponent />);

    fireEvent.click(getByText('Sign Out'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se pudo cerrar la sesión. Por favor, intenta nuevamente.');
    });
  });
});