import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; 
import providers from "@/auth.config";
import { db } from "app/lib/db";

// Definir la interfaz CustomUser
interface CustomUser {
  id: string;
  role: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers, // Utiliza la configuración de proveedores desde authConfig
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.role = customUser.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
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