// lib/auth.ts
import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email/sender';

// Constantes de tiempo para sesiones y cookies
const TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60
} as const;

// Configuración de tiempos para la aplicación
const SESSION_CONFIG = {
  MAX_AGE: TIME.MONTH, // 30 días máximo por seguridad
  UPDATE_AGE: TIME.DAY, // Actualizar la sesión cada día
  TOKEN_MAX_AGE: TIME.WEEK // 7 días para el token JWT
} as const;

// Configuración de cookies
const COOKIE_CONFIG = {
  SESSION: {
    maxAge: SESSION_CONFIG.MAX_AGE,
    updateAge: SESSION_CONFIG.UPDATE_AGE
  },
  CALLBACK: {
    maxAge: TIME.HOUR // 1 hora para la URL de callback
  }
} as const;

// Definir el rol por defecto
const DEFAULT_ROLE = 'user';

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

interface AuthLog {
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

// Logger personalizado (ahora exportado)
export const authLogger = {
  debug: (message: string, data?: Record<string, unknown>): AuthLog => {
    const log: AuthLog = { message, data };
    if (!isProd) console.log(`[Auth Debug] ${message}:`, data);
    return log;
  },
  error: (message: string, error: Error): AuthLog => {
    const log: AuthLog = { message, error };
    console.error(`[Auth Error] ${message}:`, error);
    return log;
  }
};

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === 'development',
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
          scope: "openid email profile",
          include_granted_scopes: true,
          state: Date.now().toString() // Forzar estado único
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
        authLogger.error('Redirect callback failed', error as Error);
        return baseUrl;
      }
    },
    async session({ session, token }): Promise<ExtendedSession> {
      try {
        if (session?.user && token?.id) {
          session.user.id = token.id as string;
          session.user.role = (token.role as string) || DEFAULT_ROLE;
          
          await prisma.auditLog.create({
            data: {
              userId: token.id as string,
              action: 'session.created',
              metadata: { email: session.user.email }
            }
          }).catch(error => authLogger.error('Session audit failed', error as Error));

          authLogger.debug('Session created', { userId: token.id, role: token.role });
        }
        return session as ExtendedSession;
      } catch (error) {
        authLogger.error('Session callback failed', error as Error);
        return session as ExtendedSession;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          const extendedUser = user as ExtendedUser;
          token.id = extendedUser.id;
          token.role = extendedUser.role;
          
          authLogger.debug('JWT token created', { 
            id: token.id,
            email: token.email,
            role: token.role 
          });
        }
        return token;
      } catch (error) {
        authLogger.error('JWT callback failed', error as Error);
        return token;
      }
    }
  },
  events: {
    async signIn({ user, account }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser && account?.provider === 'google') {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: DEFAULT_ROLE,
              emailVerified: new Date(),
            }
          });

          authLogger.debug('New user created', { 
            email: user.email,
            provider: account.provider 
          });

          // Enviar correo usando el nuevo sistema
          if (user.email) {
            await sendWelcomeEmail({
              email: user.email,
              name: user.name || undefined
            });
          }
        }

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: existingUser ? 'signIn' : 'userCreated',
            metadata: { 
              email: user.email,
              provider: account?.provider 
            }
          }
        });

      } catch (error) {
        authLogger.error('SignIn/Create user failed', error as Error);
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        domain: isProd ? '.referenciales.cl' : 'localhost',
        maxAge: COOKIE_CONFIG.SESSION.maxAge
      }
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: COOKIE_CONFIG.CALLBACK.maxAge
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.MAX_AGE,
    updateAge: SESSION_CONFIG.UPDATE_AGE
  }
};

// Validaciones de seguridad
if (SESSION_CONFIG.MAX_AGE > TIME.MONTH) {
  console.warn('[Auth Warning] Session maxAge exceeds recommended 30 days');
}

if (SESSION_CONFIG.UPDATE_AGE > TIME.DAY) {
  console.warn('[Auth Warning] Session updateAge exceeds recommended 24 hours');
}

export default NextAuth(authOptions);