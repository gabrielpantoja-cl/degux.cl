import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/app/lib/db";

const options: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: authConfig.providers, // Usar authConfig.providers en lugar de authConfig
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect attempt:", { url, baseUrl });
      // Asegúrate de que la redirección sea a una URL segura
      if (url.startsWith(baseUrl)) return url;
      // Si no, redirige a la página de inicio
      return baseUrl;
    },
  },
  events: {
    async linkAccount({ user }: { user: User }) {
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
  secret: process.env.NEXTAUTH_SECRET, // Asegúrate de tener esto en tus variables de entorno
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error("Auth error:", code, metadata);
    },
    warn: (code) => {
      console.warn("Auth warning:", code);
    },
  },
};

const handlers = NextAuth(options);
const { signIn } = handlers;

export { handlers, signIn };