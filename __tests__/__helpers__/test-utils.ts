// __tests__/__helpers__/test-utils.ts
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

// Interfaces
interface ProvidersWrapperProps {
  children: ReactNode;
}

interface MockSession extends Session {
  expires: string;
  user: {
    id: string;
    role?: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
}

// Mock de sesión por defecto
const mockSession: MockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { 
    id: "test-id-123",
    email: "test@test.com",
    name: "Test User",
    image: "https://test.com/image.jpg",
    role: "user"
  }
}

// Wrapper con tipos corregidos
const AllTheProviders = ({ children }: ProvidersWrapperProps) => {
  return (
    <SessionProvider session={mockSession as unknown as Session}>
      {children}
    </SessionProvider>
  )
}

// Función de renderizado personalizada con tipos
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar todo de testing-library
export * from '@testing-library/react'

// Sobrescribir render
export { customRender as render }

// Router mock con tipos
export const createMockRouter = (options: Partial<RouterMockOptions> = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn() // Corregido de jest.Mock() a jest.fn()
  },
  isFallback: false,
  ...options
})

// Helpers para testing
export const waitForLoadingToFinish = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

export const createMockSession = (overrides: Partial<MockSession> = {}): MockSession => ({
  ...mockSession,
  ...overrides
})

// Mock handlers
export const handlers = [
  // Agrega aquí tus handlers de MSW si los necesitas
]

// Tipos exportados
export type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'>