// __tests__/app/(auth)/login/login.test.js
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/(auth)/login/page';
import HomePage from '@/app/page';
import { TEST_IDS, ROUTES } from '@/__tests__/__helpers__/constants';
import { renderWithRouter } from '@/__tests__/__helpers__/test-utils';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock de next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

describe('Flujo de autenticación', () => {
  const mockRouter = {
    push: jest.fn(),
    prefetch: jest.fn()
  };

  const TEST_VALUES = {
    BUTTON_TEXT: 'Continuar con Google',
    CALLBACK_URL: ROUTES.HOME,
    HEADING_TEXT: /iniciar sesión/i,
    ERROR_TEXT: /error/i,
    TERMS_TEXT: /términos y condiciones/i
  };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe('Página de inicio', () => {
    it('debe mostrar checkbox de términos y condiciones deshabilitado inicialmente', () => {
      renderWithRouter(<HomePage />);
      
      const termsCheckbox = screen.getByRole('checkbox', { name: TEST_VALUES.TERMS_TEXT });
      const loginButton = screen.getByRole('button', { name: /log in/i });
      
      expect(termsCheckbox).not.toBeChecked();
      expect(loginButton).toBeDisabled();
    });

    it('debe habilitar botón de login al aceptar términos', async () => {
      renderWithRouter(<HomePage />);
      
      const termsCheckbox = screen.getByRole('checkbox', { name: TEST_VALUES.TERMS_TEXT });
      const loginButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.click(termsCheckbox);
      
      expect(termsCheckbox).toBeChecked();
      expect(loginButton).toBeEnabled();
      
      fireEvent.click(loginButton);
      expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  describe('Página de Login', () => {
    const renderLoginPage = () => {
      const { container } = renderWithRouter(<LoginPage />);
      return {
        googleButton: screen.getByText(TEST_VALUES.BUTTON_TEXT),
        container
      };
    };

    it('debe mostrar elementos necesarios con accesibilidad', () => {
      const { container } = renderLoginPage();
      
      expect(screen.getByRole('heading')).toHaveTextContent(TEST_VALUES.HEADING_TEXT);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', TEST_VALUES.BUTTON_TEXT);
      expect(container).toBeAccessible();
    });

    it('debe manejar flujo de autenticación exitoso', async () => {
      const mockResponse = { ok: true, token: 'fake-token' };
      signIn.mockResolvedValueOnce(mockResponse);
      
      const { googleButton } = renderLoginPage();
      
      fireEvent.click(googleButton);
      
      expect(screen.getByTestId(TEST_IDS.LOADING_SPINNER)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', {
          callbackUrl: TEST_VALUES.CALLBACK_URL
        });
        expect(screen.queryByTestId(TEST_IDS.LOADING_SPINNER)).not.toBeInTheDocument();
        expect(screen.queryByText(TEST_VALUES.ERROR_TEXT)).not.toBeInTheDocument();
      });
    });

    it('debe manejar errores de autenticación y red', async () => {
      const errors = [
        { type: 'auth', message: 'Error de autenticación' },
        { type: 'network', message: 'Error de red' }
      ];

      for (const error of errors) {
        signIn.mockRejectedValueOnce(new Error(error.message));
        const { googleButton } = renderLoginPage();
        
        fireEvent.click(googleButton);
        
        await waitFor(() => {
          const errorMessage = screen.getByText(new RegExp(error.message, 'i'));
          expect(errorMessage).toBeInTheDocument();
          expect(screen.getByRole('button')).toBeEnabled();
        });
        
        cleanup();
      }
    });
  });
});