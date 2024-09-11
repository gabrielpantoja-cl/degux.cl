// app/api/auth/[...nextauth].ts satisfies NextAuthOptions['pages'].
import NextAuth from "next-auth"
import authConfig from "@/auth.config"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }