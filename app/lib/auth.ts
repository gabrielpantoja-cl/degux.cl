// app/lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      // Custom sign-in logic
      console.log(`User signed in: ${user.name}`);
      return true;
    },
    async redirect({ baseUrl }: { baseUrl: string }) {
      // Custom redirect logic
      return baseUrl;
    },
    async session({ session }: { session: any }) {
      // Custom session logic
      return session;
    },
    async jwt({ token }: { token: any }) {
      // Custom JWT logic
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: undefined // If set, new users will be directed here on first sign in
  },
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(options);