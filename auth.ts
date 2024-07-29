import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/app/lib/db";

const options: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: authConfig,
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
};

const handlers = NextAuth(options);
const { signIn } = handlers;

export { handlers, signIn };