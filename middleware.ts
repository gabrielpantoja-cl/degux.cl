// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/', 
  '/api/auth',  // Ruta base de NextAuth
  '/api/auth/signin', // Ruta de inicio de sesión de NextAuth
  '/api/auth/signout', // Ruta de cierre de sesión de NextAuth
  '/api/auth/error', // Ruta de error de NextAuth
  '/api/auth/verify-request', // Ruta de verificación de NextAuth
  '/api/auth/callback' // Ruta de callback de NextAuth
];

// Función para verificar si una ruta es pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Permitir rutas públicas
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Verificar token usando next-auth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si no hay token y la ruta no es pública, redirigir a signin de NextAuth
  if (!token && !isPublicRoute(path)) {
    const url = new URL('/api/auth/signin', req.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // Agregar headers de seguridad
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/|api/auth).*)',
  ],
};