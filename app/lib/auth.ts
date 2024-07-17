import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google client ID or secret');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email && user.name) {
        try {
          const existingUser = await prisma.users.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.users.create({
              data: {
                name: user.name,
                email: user.email,
                password: 'temporaryPassword', // Considera usar un hash o un valor más seguro
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error al agregar usuario a la base de datos:', error);
          return false;
        } finally {
          await prisma.$disconnect(); // Cierra la conexión de Prisma
        }
      }
      console.error('Error en signIn: Proveedor no es Google o falta email/name');
      return false;
    },
  },
  pages: {
    error: '/api/auth/error',
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});