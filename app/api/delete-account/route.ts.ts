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
        { 
          success: false,
          message: 'No autorizado', 
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Usuario no encontrado', 
          error: 'Not Found' 
        },
        { status: 404 }
      );
    }

    // Eliminar usuario
    const deletedUser = await prisma.user.delete({
      where: { id: session.user.id }
    });

    // Enviar correo de confirmación
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
          to: deletedUser.email || '',
          subject: 'Cuenta Eliminada',
          text: `
            Hola,
            
            Tu cuenta ha sido eliminada exitosamente de nuestra plataforma.
            
            Si no realizaste esta acción, por favor contáctanos inmediatamente.
            
            Saludos,
            El equipo de soporte
          `,
        });
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Cuenta eliminada exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al eliminar la cuenta. Por favor, intente nuevamente.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}