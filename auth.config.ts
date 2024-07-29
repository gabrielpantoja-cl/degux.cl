import { db } from "app/lib/db";
import { loginSchema } from "@/app/lib/zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmailVerification } from "app/lib/mail";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google client ID or secret in environment variables");
}

const providers = [
  GoogleProvider({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  }),
];

const options: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account.provider === "google" && profile) {
        // Guardar el usuario en la base de datos si no existe
        const existingUser = await db.users.findUnique({ where: { email: profile.email } });
        if (!existingUser) {
          await db.users.create({
            data: {
              email: profile.email || '',
              name: profile.name || '',
              image: (profile as any).picture || '', // Usar 'as any' para evitar el error de tipo
            },
          });
        }
        return true;
      }
      return false;
    },
  },
  events: {
    async createUser({ user }) {
      // Generar un token de verificación
      const verificationToken = nanoid();
      // Guardar el token en la base de datos
      await db.verificationToken.create({
        data: {
          identifier: user.email || '',
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        },
      });
      // Enviar el correo de verificación
      await sendEmailVerification(user.email || '', verificationToken);
    },
  },
};

export default providers;