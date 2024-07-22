import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NODE_ENV, NEXTAUTH_DEBUG } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google client ID or secret');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
                password: 'temporaryPassword', 
              },
            });
          }
          console.log('User authenticated successfully:', user.email);
          return true;
        } catch (error) {
          console.error('Error adding user to the database:', error);
          return false;
        }
      }
      console.error('SignIn error: Provider is not Google or missing email/name');
      return false;
    },
    async redirect({ url, baseUrl }) {
      // Avoid redirect loops
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, user }) {
      // Add additional information to the session if necessary
      session.user.id = user.id;
      return session;
    },
    async jwt({ token, user }) {
      // Add additional information to the JWT if necessary
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: NODE_ENV === 'production',
      },
    },
  },
  debug: NEXTAUTH_DEBUG === 'true',
});

// Disconnect Prisma on process exit
process.on('exit', async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
});