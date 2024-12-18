// lib/auth.ts
import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// Tipos personalizados
interface ExtendedSession extends Session {
  user: {
    id: string;
    role: string;
    email: string;
    name?: string;
    image?: string;
  }
}

interface ExtendedUser extends User {
  id: string;
  role: string;
}

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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile" // Solicita los alcances mínimos necesarios
        }
      }
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const urlObj = new URL(url, baseUrl);
        if (urlObj.origin === baseUrl) return url;
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        return baseUrl;
      } catch (error) {
        console.error('[Auth Error] Redirect callback:', error);
        return baseUrl;
      }
    },
    async session({ session, token }): Promise<ExtendedSession> {
      try {
        if (session?.user && token?.id) {
          session.user.id = token.id as string;
          session.user.role = (token.role as string) || 'user';
          
          // Auditoría de sesión
          await prisma.auditLog.create({
            data: {
              userId: token.id as string,
              action: 'session.created',
              metadata: { email: session.user.email }
            }
          }).catch(error => console.error('[Audit Error]:', error));
        }
        return session as ExtendedSession;
      } catch (error) {
        console.error('[Auth Error] Session callback:', error);
        return session as ExtendedSession;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          const extendedUser = user as ExtendedUser;
          token.id = extendedUser.id;
          token.role = extendedUser.role;
          
          if (!isProd) {
            console.log('[Auth Debug] JWT callback:', { 
              id: token.id,
              email: token.email,
              role: token.role 
            });
          }
        }
        return token;
      } catch (error) {
        console.error('[Auth Error] JWT callback:', error);
        return token;
      }
    }
  },
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'signIn',
          metadata: { email: user.email }
        }
      }).catch(error => console.error('[Audit Error]:', error));
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
        sameSite: 'lax', // Ajuste para cumplir con las mejores prácticas de seguridad
        path: '/',
        secure: isProd,
        domain: isProd ? '.referenciales.cl' : 'localhost'
      }
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax', // Ajuste para cumplir con las mejores prácticas de seguridad
        path: '/',
        secure: isProd
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 año
    updateAge: 24 * 60 * 60 // 1 día
  }
};

export default NextAuth(authOptions);