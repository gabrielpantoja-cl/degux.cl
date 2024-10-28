import { NextResponse, type NextRequest } from "next/server";

interface AuthenticatedNextRequest extends NextRequest {
  auth?: any;
}

const publicRoutes = ["/", "/prices"];
const authRoutes = ["/login", "/register"];
const apiAuthPrefix = "/api/auth";

const isAuthenticated = (req: AuthenticatedNextRequest): boolean => {
  try {
    const token = req.cookies.get("next-auth.session-token");
    return !!token;
  } catch (error) {
    console.error("Error al verificar la autenticación:", error);
    return false;
  }
};

export default function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const isLoggedIn = isAuthenticated(req);

    console.log({ isLoggedIn, path: nextUrl.pathname });

    if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
      return NextResponse.next();
    }

    if (publicRoutes.includes(nextUrl.pathname)) {
      return NextResponse.next();
    }

    if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (
      !isLoggedIn &&
      !authRoutes.includes(nextUrl.pathname) &&
      !publicRoutes.includes(nextUrl.pathname)
    ) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isLoggedIn) {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error en el middleware:", error);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};