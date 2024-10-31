"use server";

import { signIn } from "next-auth/react";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";

// Acción para iniciar sesión con Google
export const googleLoginAction = async () => {
  try {
    const result = await signIn("google", {
      redirect: false,
    });
    if (result?.error) {
      return { error: result.error };
    }
    return { success: true };
  } catch (error) {
    console.error("Error en googleLoginAction:", error);
    return { error: "Error interno del servidor" };
  }
};

// Acción para registrar un nuevo usuario
export const registerAction = async (
  values: z.infer<typeof registerSchema>
) => {
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return {
        error: "Datos inválidos",
      };
    }

    // Verificar si el usuario ya existe
    const user = await db.user.findUnique({
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
            "Para confirmar tu identidad, inicia sesión con la misma cuenta que usaste originalmente.",
        };
      }
      return {
        error: "El usuario ya existe",
      };
    }

    // Crear el usuario sin contraseña
    await db.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });

    const result = await signIn("google", {
      redirect: false,
    });

    if (result?.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error en registerAction:", error);
    return { error: "Error interno del servidor" };
  }
};