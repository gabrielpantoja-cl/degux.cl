// lib/auth.ts
import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Constantes
const ONE_YEAR = 365 * 24 * 60 * 60;
const ONE_DAY = 24 * 60 * 60;
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

// Logger personalizado
const authLogger = {
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

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
          scope: "openid email profile"
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
  // lib/auth.ts
events: {
  async signIn({ user, account }) {
    try {
      // Verificar si es usuario nuevo
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! }
      });

      if (!existingUser && account?.provider === 'google') {
        // Crear nuevo usuario
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
      }

      // Registrar inicio de sesión
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

      // Enviar correo solo a usuarios nuevos
      if (!existingUser && user.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Bienvenido a Referenciales',
          text: `
            Hola ${user.name || ''},
            
            Gracias por registrarte en Referenciales. Tu cuenta ha sido creada exitosamente.
            
            Saludos,
            El equipo de Referenciales
          `
        });
        
        authLogger.debug('Welcome email sent', { email: user.email });
      }

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
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        domain: isProd ? '.referenciales.cl' : 'localhost',
        maxAge: ONE_YEAR
      }
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: ONE_DAY
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: ONE_YEAR,
    updateAge: ONE_DAY
  }
};

export default NextAuth(authOptions);