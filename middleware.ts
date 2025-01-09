// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ALLOWED_HOSTS = ['localhost:3000', 'referenciales.cl'];
const isProd = process.env.NODE_ENV === 'production';

// Headers de seguridad básicos
function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Aplicar headers de seguridad básicos
  setSecurityHeaders(response);
  
  // Validación básica de host (opcional)
  const host = request.headers.get('host');
  if (!ALLOWED_HOSTS.includes(host || '')) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/|images/).*)",
  ],
};