import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/app/lib/db";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
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