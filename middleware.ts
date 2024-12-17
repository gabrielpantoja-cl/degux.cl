import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface AuthenticatedNextRequest extends NextRequest {
  auth?: {
    token: any;
    user: any;
  };
}

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/", "/prices", "/terms", "/about", "/contact"];

// Rutas relacionadas con autenticación
const authRoutes = ["/login", "/register"];

// Prefijos y rutas de autenticación OAuth
const apiAuthPrefix = "/api/auth";
const oauthCallbacks = [
  "/api/auth/callback",
  "/api/auth/callback/google",
  "/api/auth/signout",
  "/api/auth/signin",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/error"  // Agregada ruta de error
];

// Rutas de assets y recursos estáticos
const staticRoutes = [
  "/_next",
  "/favicon.ico",
  "/assets",
  "/images",
  "/public"
];

const isAuthenticated = async (req: AuthenticatedNextRequest): Promise<boolean> => {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Log para diagnóstico
    if (!token) {
      console.log("[Auth Debug]: No token found");
    }

    return !!token;
  } catch (error) {
    console.error("[Auth Error]:", error);
    return false;
  }
};

const isAuthorizedUser = async (req: AuthenticatedNextRequest): Promise<boolean> => {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Lista de correos autorizados
    const authorizedEmails = [
      "gabrielpantojarivera@gmail.com"
      // Agregar más correos si es necesario
    ];
    
    const isAuthorized = authorizedEmails.includes(token?.email as string);
    
    // Log para diagnóstico
    if (!isAuthorized) {
      console.log("[Auth Debug]: Usuario no autorizado:", token?.email);
    }

    return isAuthorized;
  } catch (error) {
    console.error("[Authorization Error]:", error);
    return false;
  }
};

export default async function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Debug log
    console.log("[Middleware Debug]: Processing path:", pathname);

    // Permitir recursos estáticos
    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Permitir rutas de autenticación OAuth y manejo de errores
    if (pathname.startsWith(apiAuthPrefix) || oauthCallbacks.includes(pathname)) {
      // Log específico para OAuth
      console.log("[OAuth Debug]: Procesando ruta OAuth:", pathname);
      return NextResponse.next();
    }

    // Permitir rutas públicas
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const isLoggedIn = await isAuthenticated(req);

    // Redirigir usuarios autenticados que intentan acceder a rutas de auth
    if (isLoggedIn && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Proteger rutas privadas con mejor manejo de errores
    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      // Log para debugging
      console.log("[Auth Debug]: Redirigiendo a login, callbackUrl:", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar autorización para edición
    const editReferencialPattern = /^\/dashboard\/referenciales\/[a-f0-9-]+\/edit$/;
    if (editReferencialPattern.test(pathname)) {
      const isAuthorized = await isAuthorizedUser(req);
      if (!isAuthorized) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("[Middleware Error]:", error);
    // Mejorar el manejo de errores para OAuth
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