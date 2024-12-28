// app/api/delete-account/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { authOptions } from '@/lib/auth';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Eliminar usuario directamente
    const deletedUser = await prisma.user.delete({
      where: { id: session.user.id }
    });

    // Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: deletedUser.email,
        subject: 'Cuenta Eliminada',
        text: 'Tu cuenta ha sido eliminada exitosamente.',
      });
    } catch (emailError) {
      console.error('Error al enviar correo:', emailError);
      // Continuamos aunque falle el envío
    }

    return NextResponse.json(
      { message: 'Cuenta eliminada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la cuenta. Por favor, intente nuevamente.' },
      { status: 500 }
    );
  }
}