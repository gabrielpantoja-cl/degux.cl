import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Adapter } from "next-auth/adapters"

// Tipos compartidos
export type UserType = {
  id: string
  role: string
  email: string
  name?: string | null
}

declare module "next-auth" {
  interface Session {
    timestamp?: number
    user: UserType
  }
  
  interface User {
    id: string
    role?: string // Mantenemos role opcional
    email: string
    name?: string | null
    emailVerified?: Date | null
    image?: string | null
  }
}

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (!session?.user) throw new Error("No session user")
      return {
        ...session,
        user: {
          id: token.id as string,
          role: (token.role as string) || 'USER',
          email: token.email as string,
          name: session.user.name,
        },
        timestamp: Date.now(),
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
        token.email = user.email
        token.provider = account?.provider
      }
      return token
    },
    async signIn({ user, account }) {
      if (!user?.email) return false
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        })
        if (!existingUser && account?.provider === 'google') {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              role: 'USER',
              emailVerified: new Date(),
            },
            select: { id: true }
          })
          return !!newUser
        }
        return !!existingUser
      } catch (error) {
        console.error('[SignIn] Error:', error)
        return false
      }
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}