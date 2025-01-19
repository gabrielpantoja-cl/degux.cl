import { DefaultSession, DefaultUser } from "next-auth"
import "next-auth/jwt"

// Tipo base compartido
interface UserBase {
  id: string
  role?: string
  email: string
  name?: string | null
}

declare module "next-auth" {
  interface Session {
    user: UserBase & DefaultSession["user"]
    expires: string
  }

  interface User extends DefaultUser, UserBase {
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserBase {
    iat: number
    exp: number
    jti: string
    picture?: string | null
  }
}