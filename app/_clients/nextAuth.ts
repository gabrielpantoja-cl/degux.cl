import { prisma } from "@/app/_clients/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AdapterUser } from "next-auth/adapters";

// Define una interfaz extendida que incluya la propiedad 'role'
interface ExtendedAdapterUser extends AdapterUser {
  role: string;
}

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth client ID or secret");
}

export const options: NextAuthOptions = {
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    redirect: async ({ baseUrl }) => {
      return baseUrl;
    },
    session: async ({ session, user }) => {
      if (session?.user) {
        const extendedUser = user as ExtendedAdapterUser;
        session.user.id = extendedUser.id;
        session.user.role = extendedUser.role;
      }

      return session;
    },
  },
};