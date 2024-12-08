import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// Validación de variables de entorno
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
        session.user.role = token.role || 'user';
        console.log('Session callback - token.id:', token.id);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log('JWT callback - user.id:', user.id);
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: !isProd,
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        domain: isProd ? '.referenciales.cl' : 'localhost'
      }
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProd
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  }
};

export default NextAuth(authOptions);