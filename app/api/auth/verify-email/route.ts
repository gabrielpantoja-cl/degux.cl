// app/api/auth/verify/route.ts
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return new Response("Token no encontrado", { status: 400 });
    }

    const verifyToken = await db.verificationToken.findFirst({
      where: { token }
    });

    if (!verifyToken) {
      return new Response("Token inválido", { status: 400 });
    }

    if (verifyToken.expires < new Date()) {
      return new Response("Token expirado", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: verifyToken.identifier }
    });

    if (user?.emailVerified) {
      return new Response("Email ya verificado", { status: 400 });
    }

    // Actualizar usuario y eliminar token en una transacción
    await db.$transaction([
      db.user.update({
        where: { email: verifyToken.identifier },
        data: { emailVerified: new Date() }
      }),
      db.verificationToken.delete({
        where: { identifier: verifyToken.identifier }
      })
    ]);

    return redirect("/login?verified=true");
  } catch (error) {
    console.error("[Auth Verify Error]:", error);
    return new Response("Error de verificación", { status: 500 });
  }
}