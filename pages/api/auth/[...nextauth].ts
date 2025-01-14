// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; 
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

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

const SIGNIN_ATTEMPTS = 2;
const RETRY_DELAY = 1000;

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
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // Asegurar consistencia de datos de sesión
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        session.user.email = token.email as string;
        
        // Ahora timestamp está tipado correctamente
        session.timestamp = Date.now();
      }
      return session;
    },
    
    async jwt({ token, user, account, trigger }) {
      if (user) {
        // Actualizar token con información del usuario
        token.id = user.id;
        token.role = user.role || 'user';
        token.email = user.email;
        token.provider = account?.provider;
        token.lastSync = Date.now();
      }

      // Verificar si el token necesita actualización
      if (trigger === "update" && token.lastSync) {
        const timeSinceLastSync = Date.now() - (token.lastSync as number);
        if (timeSinceLastSync > 1000 * 60 * 60) { // 1 hora
          // Forzar revalidación de token
          token.lastSync = Date.now();
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          console.log("[SignIn] No email provided");
          return false;
        }

        let attempts = 0;
        while (attempts < SIGNIN_ATTEMPTS) {
          try {
            const existingUser = await prismaClient.user.findUnique({
              where: { email: user.email }
            });

            if (!existingUser && account?.provider === 'google') {
              console.log("[SignIn] Creating new user:", user.email);
              
              // Crear nuevo usuario con timestamp
              const newUser = await prismaClient.user.create({
                data: {
                  email: user.email,
                  name: user.name || '',
                  role: 'USER',
                  emailVerified: new Date(),
                }
              });
              
              if (newUser) {
                console.log("[SignIn] User created successfully:", newUser.email);
                return true;
              }
            } else if (existingUser) {
              // Actualizar último login
              await prismaClient.user.update({
                where: { email: user.email },
                data: {} // Solo para trigger el @updatedAt
              });
              
              console.log("[SignIn] Existing user logged in:", existingUser.email);
              return true;
            }
          } catch (error) {
            console.error(`[SignIn] Attempt ${attempts + 1} failed:`, error);
            attempts++;
            if (attempts < SIGNIN_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }
        
        throw new Error("[SignIn] Max signin attempts reached");
      } catch (error) {
        console.error('[SignIn] Fatal error:', error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout', // Agregar página de signout explícita
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log("[Event] Signin:", message);
    },
    async signOut(message) {
      console.log("[Event] Signout:", message);
    },
    async createUser(message) {
      console.log("[Event] Create user:", message);
    }
  },
  logger: {
    error: (code, ...message) => {
      console.error('[NextAuth]', code, ...message);
    },
    warn: (code, ...message) => {
      console.warn('[NextAuth]', code, ...message);
    },
    debug: (code, ...message) => {
      console.debug('[NextAuth]', code, ...message);
    },
  }
};

export default NextAuth(authOptions);