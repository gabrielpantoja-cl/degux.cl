// Path: auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server'; // Asegúrate de añadir esta línea

// Define el basePath solo para el entorno de desarrollo
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev ? '/devBasePath' : '';

export const authConfig = {
  providers: [],
  pages: {
    signIn: `${basePath}/login`,
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith(`${basePath}/dashboard`);
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        // Redirige a los usuarios no autenticados a la página de inicio de sesión
        return NextResponse.redirect(new URL(`${basePath}/login`, nextUrl.origin));
      } else if (isLoggedIn) {
        // Redirige a los usuarios autenticados al dashboard
        return NextResponse.redirect(new URL(`${basePath}/dashboard`, nextUrl.origin));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;