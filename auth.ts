import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; 
import authConfig from "@/auth.config";
import { db } from "app/lib/db";
import GoogleProvider from "next-auth/providers/google";

// Definimos los proveedores correctamente
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? (() => { throw new Error("GOOGLE_CLIENT_ID no está definido") })(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? (() => { throw new Error("GOOGLE_CLIENT_SECRET no está definido") })(),
  }),
  // Agrega otros proveedores aquí
];

// Excluimos 'providers' de 'authConfig' si está presente
const { providers: _, ...restAuthConfig } = authConfig;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers, 
  ...restAuthConfig,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.role === 'string') {
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      await db.users.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
});

