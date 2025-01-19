import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Tipos movidos a /types/next-auth.d.ts
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,  // Aseguramos el tipo correcto
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
    updateAge: 24 * 60 * 60, // 24 horas
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      if (!session?.user) throw new Error("No session user");

      return {
        ...session,
        user: {
          id: token.id as string,
          role: (token.role as string) || 'USER',
          email: token.email as string,
          name: session.user.name,
        },
        timestamp: Date.now(),
      };
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
        token.email = user.email;
        token.provider = account?.provider;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!user?.email) return false;
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        });

        if (!existingUser && account?.provider === 'google') {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              role: 'USER',
              emailVerified: new Date(),
            },
            select: { id: true }
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
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        
        for (const cookie of cookies) {
          const [name] = cookie.split('=');
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
        
        // Limpiar localStorage
        localStorage.clear();
        
        // Limpiar sessionStorage
        sessionStorage.clear();
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };