import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface AuthenticatedNextRequest extends NextRequest {
  // Puedes agregar propiedades adicionales si es necesario
}

const publicRoutes = ["/", "/prices"];
const authRoutes = ["/login", "/register"];
const apiAuthPrefix = "/api/auth";
const oauthCallbacks = [
  "/api/auth/callback",
  "/api/auth/callback/google",
  "/api/auth/signout",
  "/api/auth/signin",
  "/api/auth/session"
];

const isAuthenticated = async (req: AuthenticatedNextRequest): Promise<boolean> => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return !!token;
  } catch (error) {
    console.error("Error al verificar la autenticación:", error);
    return false;
  }
};

const isAuthorizedUser = async (req: AuthenticatedNextRequest): Promise<boolean> => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return token?.email === "gabrielpantojarivera@gmail.com";
  } catch (error) {
    console.error("Error al verificar el usuario autorizado:", error);
    return false;
  }
};

export default async function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const isLoggedIn = await isAuthenticated(req);

    // Permitir todas las rutas de autenticación y callbacks
    if (
      nextUrl.pathname.startsWith(apiAuthPrefix) ||
      oauthCallbacks.some(path => nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.next();
    }

    // Permitir rutas públicas
    if (publicRoutes.includes(nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Redirigir a dashboard si intenta acceder a rutas de auth estando autenticado
    if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Redirigir a login si intenta acceder a rutas protegidas sin autenticación
    if (
      !isLoggedIn &&
      !authRoutes.includes(nextUrl.pathname) &&
      !publicRoutes.includes(nextUrl.pathname)
    ) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar si el usuario está autorizado para acceder a la edición de la base de datos
    const editReferencialPattern = /^\/dashboard\/referenciales\/[a-f0-9-]+\/edit$/;
    if (editReferencialPattern.test(nextUrl.pathname)) {
      const isAuthorized = await isAuthorizedUser(req);
      if (!isAuthorized) {
        const unauthorizedUrl = new URL("/unauthorized", nextUrl);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Error en el middleware:", error);
    const errorUrl = new URL("/auth/error", req.url);
    errorUrl.searchParams.set("error", "middleware_error");
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)",
  ],
};