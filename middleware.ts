import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface AuthenticatedNextRequest extends NextRequest {
  auth?: {
    token: any;
    user: any;
  };
}

const publicRoutes = ["/", "/prices", "/terms", "/about", "/contact"];
const authRoutes = ["/login", "/register"];
const apiAuthPrefix = "/api/auth";
const oauthCallbacks = [
  "/api/auth/callback",
  "/api/auth/callback/google",
  "/api/auth/signout",
  "/api/auth/signin",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/error"
];
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

    // Eliminamos la verificación de correos autorizados
    return true;
  } catch (error) {
    console.error("[Authorization Error]:", error);
    return false;
  }
};

export default async function middleware(req: AuthenticatedNextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    console.log("[Middleware Debug]: Processing path:", pathname);

    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    if (pathname.startsWith(apiAuthPrefix) || oauthCallbacks.includes(pathname)) {
      console.log("[OAuth Debug]: Procesando ruta OAuth:", pathname);
      return NextResponse.next();
    }

    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const isLoggedIn = await isAuthenticated(req);

    if (isLoggedIn && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.log("[Auth Debug]: Redirigiendo a login, callbackUrl:", pathname);
      return NextResponse.redirect(loginUrl);
    }

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