import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'No autorizado'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { referenciales: true }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Usuario no encontrado'
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (user.referenciales.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'No se puede eliminar la cuenta mientras tenga registros asociados'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await prisma.$transaction([
      prisma.account.deleteMany({ where: { userId: session.user.id } }),
      prisma.session.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } })
    ]);

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Cuenta eliminada exitosamente'
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Error al eliminar la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}