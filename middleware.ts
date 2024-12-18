import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Validación de variables de entorno
const REQUIRED_ENV_VARS = [
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET'
];

REQUIRED_ENV_VARS.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Configuración de rutas mejorada
const publicRoutes = ["/", "/prices", "/terms", "/about", "/contact"];
const authRoutes = ["/login", "/register", "/auth/error"];
const apiAuthPrefix = "/api/auth";
const oauthCallbacks = [
  "/api/auth/callback",
  "/api/auth/callback/google",
  "/api/auth/signout",
  "/api/auth/signin",
  "/api/auth/signin/google", // Agregar ruta específica
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/error",
  "/api/auth/csrf",
  "/api/auth/callback/credentials"
];
const staticRoutes = [
  "/_next",
  "/favicon.ico",
  "/assets",
  "/images",
  "/public",
  "/_/common/diagnostics"
];

const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_HOSTS = ['localhost:3000', 'referenciales.cl'];

// Tipos mejorados
interface AuthenticatedRequest extends NextRequest {
  auth?: {
    token: any;
    user: any;
  };
}

// Headers de seguridad mejorados
function setSecurityHeaders(response: NextResponse): NextResponse {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleusercontent.com https://*.google.com",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "img-src 'self' data: blob: https: https://*.googleusercontent.com https://*.google.com",
    "frame-src 'self' https://accounts.google.com",
    "connect-src 'self' https://accounts.google.com https://*.google.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "form-action 'self' https://accounts.google.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

async function getAuthToken(req: AuthenticatedRequest) {
  try {
    return await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: true,
      cookieName: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    });
  } catch (error) {
    console.error("[Auth Error]:", error);
    return null;
  }
}

async function isAuthenticated(req: AuthenticatedRequest): Promise<boolean> {
  const token = await getAuthToken(req);
  return !!token;
}

export default async function middleware(req: AuthenticatedRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const host = req.headers.get('host');

    // Mejorar logging para debugging
    console.log("[Middleware Detailed Debug]:", {
      path: pathname,
      isProd,
      host,
      referer: req.headers.get('referer'),
      isCallback: pathname.includes('/callback'),
      isAuthRoute: pathname.startsWith(apiAuthPrefix)
    });

    // Permitir todas las rutas OAuth sin restricciones
    if (pathname.startsWith(apiAuthPrefix)) {
      console.log("[OAuth Flow]:", pathname);
      const response = NextResponse.next();
      return setSecurityHeaders(response);
    }

    // Validación de host
    if (!ALLOWED_HOSTS.includes(host || '')) {
      console.error("[Security Error]: Invalid host", host);
      return NextResponse.redirect(new URL("/auth/error", nextUrl));
    }

    // Assets estáticos
    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Rutas públicas
    if (publicRoutes.includes(pathname)) {
      return setSecurityHeaders(NextResponse.next());
    }

    // Autenticación
    const isLoggedIn = await isAuthenticated(req);

    // Manejo de rutas autenticadas
    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      if (pathname !== '/login') {
        loginUrl.searchParams.set("callbackUrl", pathname);
      }
      return setSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return setSecurityHeaders(NextResponse.next());

  } catch (error) {
    console.error("[Middleware Critical Error]:", error);
    return setSecurityHeaders(
      NextResponse.redirect(new URL("/auth/error", req.url))
    );
  }
}

// Ajustar matcher para permitir todas las rutas de auth
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)",
  ],
};