// __tests__/__helpers__/test-utils.ts
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

// Tipos para el wrapper de providers
type ProvidersWrapperProps = {
  children: ReactNode
}

// Mock de sesión por defecto
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { 
    email: "test@test.com",
    name: "Test User",
    image: "https://test.com/image.jpg"
  }
}

// Wrapper que contiene todos los providers necesarios
const AllTheProviders = ({ children }: ProvidersWrapperProps) => {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  )
}

// Función de renderizado personalizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar todo de testing-library
export * from '@testing-library/react'

// Sobrescribir render con render personalizado
export { customRender as render }

// Exportar utilidades adicionales
export const createMockRouter = (options: any) => ({
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
    emit: jest.fn()
  },
  isFallback: false,
  ...options
})

// Helpers para testing
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

export const createMockSession = (overrides = {}) => ({
  ...mockSession,
  ...overrides
})

// Mock handlers comunes
export const handlers = [
  // Agrega aquí tus handlers de MSW si los necesitas
]

// Tipos útiles
export type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'>