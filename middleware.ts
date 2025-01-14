// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback/google',
  '/api/auth/csrf',
  '/api/auth/session',
];

// Función mejorada para verificar rutas públicas
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => 
    path === route || 
    path.startsWith('/api/auth/') || 
    path.startsWith('/_next/') ||
    path.includes('favicon.ico')
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Debug en producción
  console.log(`[Middleware] Accediendo a ruta: ${path}`);

  // Permitir rutas públicas
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  try {
    // Verificación mejorada del token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    console.log(`[Middleware] Token encontrado: ${!!token}`);

    // Si no hay token, redirigir a signin
    if (!token) {
      console.log('[Middleware] No hay token, redirigiendo a signin');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Verificar si el usuario está activo
    if (!token.email) {
      console.log('[Middleware] Token inválido, forzando logout');
      return NextResponse.redirect(new URL('/auth/signout', req.url));
    }

    // Configurar respuesta con headers de seguridad
    const response = NextResponse.next();
    
    // Headers de seguridad mejorados
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Headers de cache para prevenir problemas de persistencia
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    
    return response;

  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
};