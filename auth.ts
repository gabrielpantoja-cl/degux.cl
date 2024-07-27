import NextAuth, { NextAuthOptions, User, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import providers from "@/auth.config";
import { db } from "app/lib/db";

// Definir la interfaz CustomUser
interface CustomUser extends User {
  id: string;
  role: string;
}

interface CustomToken extends JWT {
  role?: string;
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, account, profile, trigger, isNewUser, session }: { token: CustomToken, user?: User, account?: Account | null, profile?: Profile, trigger?: "signIn" | "signUp" | "update", isNewUser?: boolean, session?: any }) {
      if (user) {
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    session({ session, token }: { session: any, token: CustomToken }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }: { user: User }) {
      await db.users.update({
        where: { id: (user as CustomUser).id },
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

const authHandler = NextAuth(authOptions);

if (!authHandler) {
  throw new Error("authHandler is undefined");
}

const { handlers, signIn, signOut, auth } = authHandler;

if (!handlers) {
  throw new Error("handlers is undefined");
}

export { handlers, signIn, signOut, auth };
export default authOptions;