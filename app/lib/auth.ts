//app/lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider === 'google' && user.email && user.name) {
        try {
          // Verifica si el usuario ya existe en la base de datos
          const existingUser = await prisma.users.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Si el usuario no existe, agrégalo a la base de datos
            await prisma.users.create({
              data: {
                name: user.name ?? '', // Asegura que name no sea null o undefined
                email: user.email ?? '', // Asegura que email no sea null o undefined
                password: 'temporaryPassword', // Proporciona una contraseña temporal
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error al agregar usuario a la base de datos:', error);
          return false;
        }
      }
      return false; // Devuelve false si account no es de Google o user.email/user.name es null/undefined
    },
  },
});