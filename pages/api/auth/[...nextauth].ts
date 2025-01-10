// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

const SIGNIN_ATTEMPTS = 2; // Intentos máximos de login
const RETRY_DELAY = 1000; // Delay entre intentos en ms

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Asegurar que tenemos toda la información necesaria
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.provider = account?.provider;
      }
      return token;
    },
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          console.log("No email provided");
          return false;
        }

        // Implementar retry logic para nuevos usuarios
        let attempts = 0;
        while (attempts < SIGNIN_ATTEMPTS) {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email }
            });

            if (!existingUser && account?.provider === 'google') {
              console.log("Creating new user:", user.email);
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || '',
                  role: 'user',
                  emailVerified: new Date(), // Marcar email como verificado
                }
              });
              
              // Esperar un momento para asegurar que la BD se actualice
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              
              // Verificar que el usuario se creó correctamente
              const newUser = await prisma.user.findUnique({
                where: { email: user.email }
              });
              
              if (newUser) {
                console.log("User created successfully:", newUser.email);
                return true;
              }
            } else if (existingUser) {
              console.log("Existing user found:", existingUser.email);
              return true;
            }
          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            attempts++;
            if (attempts < SIGNIN_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }
        
        throw new Error("Max signin attempts reached");
      } catch (error) {
        console.error('Fatal error in signIn:', error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log("Signin event:", message);
    },
    async createUser(message) {
      console.log("Create user event:", message);
    }
  },
  logger: {
    error: (code, ...message) => {
      console.error(code, ...message);
    },
    warn: (code, ...message) => {
      console.warn(code, ...message);
    },
    debug: (code, ...message) => {
      console.debug(code, ...message);
    },
  }
};

export default NextAuth(authOptions);