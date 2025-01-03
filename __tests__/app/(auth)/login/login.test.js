// __tests__/app/(auth)/login/login.test.js
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoginPage from '../../../../app/(auth)/login/page';

// Constantes para valores reutilizables
const TEST_VALUES = {
  BUTTON_TEXT: 'Continuar con Google',
  CALLBACK_URL: 'http://localhost:3000',
  HEADING_TEXT: /iniciar sesión/i,
  ERROR_TEXT: /error/i
};

jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

describe('LoginPage', () => {
  // Helper function para renderizar el componente
  const renderLoginPage = () => {
    render(<LoginPage />);
    return screen.getByText(TEST_VALUES.BUTTON_TEXT);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe mostrar todos los elementos necesarios', () => {
      render(<LoginPage />);
      
      // Verifica elementos principales
      expect(screen.getByRole('heading')).toHaveTextContent(TEST_VALUES.HEADING_TEXT);
      expect(screen.getByText(TEST_VALUES.BUTTON_TEXT)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('debe tener los atributos de accesibilidad correctos', () => {
      render(<LoginPage />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAccessibleName();
    });
  });

  describe('Interacción del usuario', () => {
    it('debe llamar a signIn con los parámetros correctos', async () => {
      const googleButton = renderLoginPage();
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', {
          callbackUrl: TEST_VALUES.CALLBACK_URL
        });
        expect(signIn).toHaveBeenCalledTimes(1);
      });
    });

    it('debe mostrar estado de carga durante la autenticación', async () => {
      signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const googleButton = renderLoginPage();
      
      fireEvent.click(googleButton);
      
      // Verifica estado de carga
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getByRole('button')).toBeEnabled();
      });
    });
  });

  describe('Manejo de respuestas', () => {
    it('debe manejar respuesta exitosa correctamente', async () => {
      const mockResponse = { ok: true, token: 'fake-token' };
      signIn.mockResolvedValueOnce(mockResponse);
      
      const googleButton = renderLoginPage();
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalled();
        expect(screen.queryByText(TEST_VALUES.ERROR_TEXT)).not.toBeInTheDocument();
      });
    });

    it('debe manejar errores de autenticación', async () => {
      const mockError = new Error('Error de autenticación');
      signIn.mockRejectedValueOnce(mockError);
      
      const googleButton = renderLoginPage();
      fireEvent.click(googleButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(TEST_VALUES.ERROR_TEXT);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(mockError.message);
      });
    });

    it('debe manejar error de red', async () => {
      const networkError = new Error('Network Error');
      signIn.mockRejectedValueOnce(networkError);
      
      const googleButton = renderLoginPage();
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/error de red/i)).toBeInTheDocument();
      });
    });
  });
});