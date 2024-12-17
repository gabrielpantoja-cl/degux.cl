import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface AuthenticatedRequest extends NextRequest {
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

async function getAuthToken(req: AuthenticatedRequest) {
  try {
    return await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
  } catch (error) {
    console.error("[Auth Error]:", error);
    return null;
  }
}

async function isAuthenticated(req: AuthenticatedRequest): Promise<boolean> {
  const token = await getAuthToken(req);
  if (!token) {
    console.log("[Auth Debug]: No token found");
    return false;
  }
  return true;
}

export default async function middleware(req: AuthenticatedRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Debug
    console.log("[Middleware Debug]: Processing path:", pathname);

    // Static assets check
    if (staticRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // OAuth routes check
    if (pathname.startsWith(apiAuthPrefix) || oauthCallbacks.includes(pathname)) {
      console.log("[OAuth Debug]: Processing OAuth route:", pathname);
      return NextResponse.next();
    }

    // Public routes check
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Authentication check
    const isLoggedIn = await isAuthenticated(req);

    // Redirect authenticated users away from auth routes
    if (isLoggedIn && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Redirect unauthenticated users to login
    if (!isLoggedIn && !authRoutes.includes(pathname)) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.log("[Auth Debug]: Redirecting to login, callbackUrl:", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check referencial edit permissions
    const editReferencialPattern = /^\/dashboard\/referenciales\/[a-f0-9-]+\/edit$/;
    if (editReferencialPattern.test(pathname)) {
      const token = await getAuthToken(req);
      if (!token) {
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