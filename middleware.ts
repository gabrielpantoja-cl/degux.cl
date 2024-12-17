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

interface AuthenticatedRequest extends NextRequest {
  auth?: {
    token: any;
    user: any;
  };
}

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

function setCookieHeaders(response: NextResponse): NextResponse {
  if (isProd) {
    response.headers.set('Set-Cookie', [
      'SameSite=None; Secure',
      'Path=/',
      `Domain=${isProd ? '.referenciales.cl' : 'localhost'}`
    ].join(';'));
  }
  return response;
}

export default async function middleware(req: AuthenticatedRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const host = req.headers.get('host');

    // Validación de host
    if (!ALLOWED_HOSTS.includes(host || '')) {
      console.error("[Security Error]: Invalid host", host);
      return NextResponse.redirect(new URL("/auth/error", nextUrl));
    }

    // Debug mejorado
    console.log("[Middleware Debug]:", {
      path: pathname,
      isProd,
      host,
      referer: req.headers.get('referer')
    });

    // Static assets
    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // OAuth routes
    if (pathname.startsWith(apiAuthPrefix)) {
      if (oauthCallbacks.includes(pathname)) {
        console.log("[OAuth Debug]: Processing callback:", pathname);
        const response = NextResponse.next();
        return setCookieHeaders(response);
      }
      return NextResponse.next();
    }

    // Rutas públicas
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Autenticación
    const isLoggedIn = await isAuthenticated(req);

    // Redirigir usuarios autenticados
    if (isLoggedIn && authRoutes.includes(pathname)) {
      const response = NextResponse.redirect(new URL("/dashboard", nextUrl));
      return setCookieHeaders(response);
    }

    // Redirigir usuarios no autenticados
    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      const response = NextResponse.redirect(loginUrl);
      return setCookieHeaders(response);
    }

    // Permisos para referenciales
    if (/^\/dashboard\/referenciales\/[a-f0-9-]+\/edit$/.test(pathname)) {
      const token = await getAuthToken(req);
      if (!token) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
      }
    }

    const response = NextResponse.next();
    return setCookieHeaders(response);

  } catch (error) {
    console.error("[Middleware Error]:", error);
    const errorUrl = new URL("/auth/error", req.url);
    errorUrl.searchParams.set("error", error instanceof Error ? error.message : "middleware_error");
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)",
  ],
};