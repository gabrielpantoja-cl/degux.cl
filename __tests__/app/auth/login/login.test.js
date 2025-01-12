// __tests__/app/(auth)/login/login.test.js
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HomePage from '../../../../app/page';
import { TEST_IDS, ROUTES } from '../../__helpers__/constants';
import { renderWithRouter } from '../../__helpers__/test-utils';

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
      expect(signIn).toHaveBeenCalledWith('google', {
        callbackUrl: TEST_VALUES.CALLBACK_URL
      });
    });

    it('debe manejar flujo de autenticación exitoso', async () => {
      const mockResponse = { ok: true, token: 'fake-token' };
      signIn.mockResolvedValueOnce(mockResponse);
      
      renderWithRouter(<HomePage />);
      const loginButton = screen.getByRole('button', { name: /log in/i });
      const termsCheckbox = screen.getByRole('checkbox', { name: TEST_VALUES.TERMS_TEXT });
      
      fireEvent.click(termsCheckbox);
      fireEvent.click(loginButton);
      
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
        renderWithRouter(<HomePage />);
        
        const loginButton = screen.getByRole('button', { name: /log in/i });
        const termsCheckbox = screen.getByRole('checkbox', { name: TEST_VALUES.TERMS_TEXT });
        
        fireEvent.click(termsCheckbox);
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const errorMessage = screen.getByText(new RegExp(error.message, 'i'));
          expect(errorMessage).toBeInTheDocument();
          expect(loginButton).toBeEnabled();
        });
        
        cleanup();
      }
    });
  });
});