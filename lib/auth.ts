import { AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
  throw new Error("Missing Google client ID, secret, or redirect URI in environment variables");
}

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          redirect_uri: googleRedirectUri,
        },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" as const },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirigir al dashboard después de la autenticación
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`;
    },
    async signIn(/*{ user, account, profile, email, credentials }*/) {
      // Aquí puedes agregar lógica adicional para manejar el inicio de sesión
      return true;
    },
    async jwt({ token, user /*, account, profile, isNewUser*/ }) {
      // Agregar información adicional al token JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export { authOptions };