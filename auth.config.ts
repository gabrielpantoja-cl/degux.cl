// Path: auth.config.ts
import type { NextAuthConfig } from 'next-auth';

// Define el basePath solo para el entorno de desarrollo
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev ? '/devBasePath' : '';

export const authConfig = {
  providers: [],
  pages: {
    signIn: `${basePath}/login`,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith(`${basePath}/dashboard`);
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Asegúrate de incluir el basePath en la URL de redirección
        return Response.redirect(new URL(`${basePath}/dashboard`, nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;