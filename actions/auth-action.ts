"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const loginAction = async (values: z.infer<typeof loginSchema>) => {
  try {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      return { error: result.error };
    }
    return { success: true };
  } catch (error) {
    return { error: "error 500" };
  }
};

export const registerAction = async (
  values: z.infer<typeof registerSchema>
) => {
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return {
        error: "Invalid data",
      };
    }

    // verificar si el usuario ya existe
    const user = await db.users.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true, // Incluir las cuentas asociadas
      },
    });

    if (user) {
      // Verificar si tiene cuentas OAuth vinculadas
      const oauthAccounts = user.accounts.filter(
        (account) => account.type === "oauth"
      );
      if (oauthAccounts.length > 0) {
        return {
          error:
            "To confirm your identity, sign in with the same account you used originally.",
        };
      }
      return {
        error: "User already exists",
      };
    }

    // hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // crear el usuario
    await db.users.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
      },
    });

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    return { error: "error 500" };
  }
};