import { NextApiResponse, NextApiRequest } from 'next';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(authConfig);
}

export const config = {
  api: {
    bodyParser: false,
  },
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|customers|.png).*)'],
};