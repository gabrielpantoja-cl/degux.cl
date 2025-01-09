// lib/auth.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Validar variables de entorno requeridas
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google OAuth credentials");
}

// Constantes de tiempo
const TIME = {
  DAY: 24 * 60 * 60,    // 24 horas en segundos
  MONTH: 30 * 24 * 60 * 60  // 30 días en segundos
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Asegurar que después del login vaya al dashboard
      if (url.startsWith(baseUrl)) {
        if (url.includes('/api/auth/signin')) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }
      if (url.startsWith('/dashboard')) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string || 'user';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/auth/error',
    // Especificar página después del login
    newUser: '/dashboard'
  },
};

export default NextAuth(authOptions);