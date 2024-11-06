import { NextResponse, type NextRequest } from "next/server";

interface AuthenticatedNextRequest extends NextRequest {/*...*/ }

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

const isAuthenticated = (req: AuthenticatedNextRequest): boolean => {
  try {
    // Comprobar tanto cookies seguras como no seguras
    const isProd = process.env.NODE_ENV === 'production';
    const sessionToken = isProd
      ? req.cookies.get("__Secure-next-auth.session-token")
      : req.cookies.get("next-auth.session-token");

    return !!sessionToken;
  } catch (error) {
    console.error("Error al verificar la autenticación:", error);
    return false;
  }
};

export default function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const isLoggedIn = isAuthenticated(req);

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