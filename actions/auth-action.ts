// action/auth-action.ts
"use server";

import { signIn } from "next-auth/react";
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

    // No es necesario verificar si el usuario ya existe o crear un nuevo usuario aquí
    // NextAuth con Google Provider manejará esto automáticamente

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