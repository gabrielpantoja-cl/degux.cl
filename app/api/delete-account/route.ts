import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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

    // Verificar si el usuario tiene registros en la tabla de referenciales
    const userRecords = await prisma.referenciales.findMany({
      where: { userId: session.user.id }
    });

    if (userRecords.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Existen registros asociados a tu usuario en la base de datos. En este momento no se puede eliminar tu cuenta. Por favor, contacta con soporte al WhatsApp.',
          error: 'User has records'
        },
        { status: 400 }
      );
    }

    // Eliminar usuario y verificar resultado
    await prisma.user.delete({
      where: { id: session.user.id }
    });

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