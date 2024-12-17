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
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/error",
  "/api/auth/csrf"
];
const staticRoutes = [
  "/_next",
  "/favicon.ico",
  "/assets",
  "/images",
  "/public"
];

const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_HOSTS = ['localhost:3000', 'referenciales.cl'];

function setSecurityHeaders(response: NextResponse): NextResponse {
  // CSP Headers mejorados para Google OAuth
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleusercontent.com",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "img-src 'self' data: blob: https: https://*.googleusercontent.com",
    "frame-src 'self' https://accounts.google.com",
    "connect-src 'self' https://accounts.google.com https://*.google.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "form-action 'self' https://accounts.google.com",
  ].join('; '));

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

function setCookieHeaders(response: NextResponse): NextResponse {
  const cookieOptions = [
    'SameSite=Lax',
    isProd ? 'Secure' : '',
    'Path=/',
    `Domain=${isProd ? '.referenciales.cl' : 'localhost'}`,
    'HttpOnly'
  ].filter(Boolean);

  response.headers.set('Set-Cookie', cookieOptions.join('; '));
  return setSecurityHeaders(response);
}

async function getAuthToken(req: AuthenticatedRequest) {
  try {
    return await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: isProd,
      cookieName: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    });
  } catch (error) {
    console.error("[Auth Error]:", error);
    return null;
  }
}

interface AuthenticatedRequest extends NextRequest {
  auth?: {
    token: any;
    user: any;
  };
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

    // Debug mejorado
    console.log("[Middleware Debug]:", {
      path: pathname,
      isProd,
      host,
      referer: req.headers.get('referer'),
      cookies: req.cookies.getAll()
    });

    // Validación de host
    if (!ALLOWED_HOSTS.includes(host || '')) {
      console.error("[Security Error]: Invalid host", host);
      return NextResponse.redirect(new URL("/auth/error", nextUrl));
    }

    // Static assets y rutas públicas
    if (staticRoutes.some(route => pathname.startsWith(route)) || 
        publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Manejo especial de rutas OAuth
    if (pathname.startsWith(apiAuthPrefix)) {
      if (oauthCallbacks.includes(pathname)) {
        console.log("[OAuth Debug]: Processing callback:", pathname);
        const response = NextResponse.next();
        return setCookieHeaders(response);
      }
      return NextResponse.next();
    }

    // Verificación de autenticación
    const isLoggedIn = await isAuthenticated(req);

    // Redireccionamiento basado en autenticación
    if (isLoggedIn && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    return setCookieHeaders(response);

  } catch (error) {
    console.error("[Middleware Error]:", error);
    const errorUrl = new URL("/auth/error", req.url);
    errorUrl.searchParams.set("error", 
      error instanceof Error ? error.message : "middleware_error"
    );
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)",
  ],
};