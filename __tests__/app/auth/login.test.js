// __tests__/app/auth/login.test.js
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/auth/login/page';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Renderizado', () => {
    it('debe renderizar el botón de Google correctamente', () => {
      render(<LoginPage />);
      const googleButton = screen.getByText('Continuar con Google');
      expect(googleButton).toBeInTheDocument();
    });

    it('debe mostrar el título de inicio de sesión', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading')).toHaveTextContent(/iniciar sesión/i);
    });
  });

  describe('Autenticación con Google', () => {
    it('debe llamar a signIn con el proveedor Google', async () => {
      render(<LoginPage />);
      const googleButton = screen.getByText('Continuar con Google');
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledTimes(1);
        expect(signIn).toHaveBeenCalledWith('google', {
          callbackUrl: 'http://localhost:3000',
        });
      });
    });

    it('debe manejar el token correctamente en caso de éxito', async () => {
      const mockToken = 'fake-token';
      signIn.mockResolvedValueOnce({ token: mockToken, ok: true });

      render(<LoginPage />);
      const googleButton = screen.getByText('Continuar con Google');
      
      fireEvent.click(googleButton);

      await waitFor(async () => {
        const result = await signIn('google', {
          callbackUrl: 'http://localhost:3000',
        });
        expect(result.token).toBe(mockToken);
        expect(result.ok).toBe(true);
      });
    });

    it('debe manejar errores de autenticación', async () => {
      const mockError = new Error('Error de autenticación');
      signIn.mockRejectedValueOnce(mockError);

      render(<LoginPage />);
      const googleButton = screen.getByText('Continuar con Google');
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalled();
        const errorMessage = screen.queryByText(/error/i);
        expect(errorMessage).not.toBeNull();
      });
    });
  });
});