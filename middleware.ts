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
  "/api/auth/providers"
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
    
    return authorizedEmails.includes(token?.email as string);
  } catch (error) {
    console.error("[Authorization Error]:", error);
    return false;
  }
};

export default async function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Permitir recursos estáticos
    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Permitir rutas de autenticación OAuth
    if (pathname.startsWith(apiAuthPrefix) || oauthCallbacks.includes(pathname)) {
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

    // Proteger rutas privadas
    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
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
    return NextResponse.redirect(
      new URL(`/auth/error?error=middleware_error`, req.url)
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)",
  ],
};