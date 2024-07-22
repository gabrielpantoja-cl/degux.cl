import { NextResponse, type NextRequest } from "next/server";

// Extender el tipo NextRequest para incluir la propiedad auth
interface AuthenticatedNextRequest extends NextRequest {
  auth?: any;
}

const publicRoutes = ["/", "/prices"];
const authRoutes = ["/login", "/register"];
const apiAuthPrefix = "/api/auth";

// Función para verificar la autenticación (ejemplo básico)
const isAuthenticated = (req: AuthenticatedNextRequest): boolean => {
  // Aquí deberías implementar tu lógica de autenticación
  // Por ejemplo, verificar un token en las cookies o en los encabezados
  const token = req.cookies.get("auth-token");
  return !!token;
};

export default function middleware(req: AuthenticatedNextRequest) {
  const { nextUrl } = req;
  const isLoggedIn = isAuthenticated(req);

  console.log({ isLoggedIn, path: nextUrl.pathname });

  // Permitir todas las rutas de API de autenticación
  if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Permitir acceso a rutas públicas sin importar el estado de autenticación
  if (publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Redirigir a /dashboard si el usuario está logueado y trata de acceder a rutas de autenticación
  if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirigir a /login si el usuario no está logueado y trata de acceder a una ruta protegida
  if (
    !isLoggedIn &&
    !authRoutes.includes(nextUrl.pathname) &&
    !publicRoutes.includes(nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};