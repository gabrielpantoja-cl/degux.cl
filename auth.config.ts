// Path: auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        // Redirige a los usuarios no autenticados a la página de inicio de sesión
        return NextResponse.redirect(new URL('/login', nextUrl.origin));
      } else if (isLoggedIn) {
        // Redirige a los usuarios autenticados al dashboard
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;