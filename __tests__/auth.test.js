//  auth.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoginPage from '../../app/auth/login/page'; 

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('Google OAuth Authentication', () => {
  it('should call signIn with Google provider', async () => {
    render(<LoginPage />);

    const googleButton = screen.getByText('Continuar con Google');
    fireEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith('google', {
      callbackUrl: 'http://localhost:3000',
    });
  });

  it('should handle token correctly', async () => {
    const token = 'fake-token';
    signIn.mockResolvedValueOnce({ token });

    render(<LoginPage />);

    const googleButton = screen.getByText('Continuar con Google');
    fireEvent.click(googleButton);

    const result = await signIn('google', {
      callbackUrl: 'http://localhost:3000',
    });

    expect(result.token).toBe(token);
  });
});