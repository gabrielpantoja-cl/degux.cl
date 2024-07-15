import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Importar el método getToken de next-auth/jwt

// Define the middleware function
export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const salt = process.env.AUTH_SALT;

  if (!secret) {
    throw new Error('AUTH_SECRET no está definido en las variables de entorno');
  }

  if (!salt) {
    throw new Error('AUTH_SALT no está definido en las variables de entorno');
  }

  // Obtener el token de sesión
  const token = await getToken({ req: request, secret, salt });

  // Verificar si el token existe
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

// Configuración del matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};