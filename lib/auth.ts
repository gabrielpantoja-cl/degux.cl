import NextAuth, { NextAuthOptions, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Tipo base para usuario
type UserBase = {
  id: string
  role: string // Ahora es obligatorio
  email: string
  name?: string | null
}

declare module "next-auth" {
  interface Session {
    user: UserBase
  }

  interface User {
    id: string
    role?: string
    email: string
    name?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          id: token.sub as string,
          role: token.role as string,
          email: token.email as string,
          name: session.user.name
        }
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "USER"
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
    error: "/error",
  }
}

export const { auth, signIn, signOut } = NextAuth(authOptions)