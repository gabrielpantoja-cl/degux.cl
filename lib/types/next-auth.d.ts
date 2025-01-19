// lib/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      email: string;
      name?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    email: string;
    name?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    email?: string;
    name?: string | null;
    picture?: string | null;
  }
}