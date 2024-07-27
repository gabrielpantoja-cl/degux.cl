import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/app/lib/db";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? (() => { throw new Error("Missing GOOGLE_CLIENT_ID") })();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? (() => { throw new Error("Missing GOOGLE_CLIENT_SECRET") })();

const options: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  ...authConfig,
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