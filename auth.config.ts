import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign-in attempt:", { user, account, profile });
      // Lógica personalizada para el inicio de sesión
      return true; // Permite el inicio de sesión
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect attempt:", { url, baseUrl });
      // Asegúrate de que la redirección sea a una URL segura
      if (url.startsWith(baseUrl)) return url;
      // Si no, redirige a la página de inicio
      return baseUrl;
    },
    async session({ session }) {
      // Puedes añadir datos adicionales a la sesión aquí
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Asegúrate de tener esto en tus variables de entorno
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error("Auth error:", code, metadata);
    },
    warn: (code) => {
      console.warn("Auth warning:", code);
    },
  },
};

export default authConfig;