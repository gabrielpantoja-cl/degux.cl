// __tests__/__mocks__/providers/google-provider.ts
import { Provider } from 'next-auth/providers';

// Constantes para testing
export const MOCK_GOOGLE_ID = 'mock-google-id';
export const MOCK_GOOGLE_SECRET = 'mock-google-secret';

// Mock de credenciales de usuario
export const mockGoogleProfile = {
  sub: '123456789',
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  email: 'test@example.com',
  email_verified: true,
  picture: 'https://example.com/picture.jpg',
};

// Mock de respuesta de autenticación
export const mockGoogleResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  profile: mockGoogleProfile,
};

// Mock del proveedor de Google
export const mockGoogleProvider: Provider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code'
    }
  },
  clientId: MOCK_GOOGLE_ID,
  clientSecret: MOCK_GOOGLE_SECRET,
  idToken: true,
  checks: ['pkce', 'state'],
  profile: (profile) => {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    }
  },
};

// Mock de la función de callback
export const mockGoogleCallback = jest.fn().mockImplementation(async () => {
  return mockGoogleResponse;
});

// Mock completo del provider para usar en tests
export default {
  ...mockGoogleProvider,
  credentials: undefined,
  options: {
    clientId: MOCK_GOOGLE_ID,
    clientSecret: MOCK_GOOGLE_SECRET,
  },
  callback: mockGoogleCallback,
};

// Mock del SessionProvider
export const mockSession = {
  data: {
    user: {
      name: mockGoogleProfile.name,
      email: mockGoogleProfile.email,
      image: mockGoogleProfile.picture,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  status: 'authenticated',
};

// Tipos para el wrapper de providers
export interface ProvidersWrapperProps {
  children: React.ReactNode;
}

// Wrapper que contiene todos los providers necesarios
export const AllTheProviders = ({ children }: ProvidersWrapperProps) => {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  );
};