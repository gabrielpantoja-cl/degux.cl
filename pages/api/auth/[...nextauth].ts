// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; 
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// Extender tipos de next-auth
declare module "next-auth" {
  interface Session {
    timestamp?: number;
    user: {
      id: string;
      role: string;
      email: string;
      name?: string | null;
    }
  }
}

const prismaClient = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        }
      }
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        session.user.email = token.email as string;
        session.timestamp = Date.now(); // Ahora TypeScript reconoce timestamp
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.email = user.email;
        token.provider = account?.provider;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!user?.email) return false;
      
      try {
        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser && account?.provider === 'google') {
          const newUser = await prismaClient.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              role: 'USER',
              emailVerified: new Date(),
            }
          });
          return !!newUser;
        }
        
        return !!existingUser;
      } catch (error) {
        console.error('[SignIn] Error:', error);
        return false;
      }
    }
  },
  events: {
    async signOut() {
      // Limpiar cookies al cerrar sesión
      if (typeof window !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }
    }
  }
};

export default NextAuth(authOptions);