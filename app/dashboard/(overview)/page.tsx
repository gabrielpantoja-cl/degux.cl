// app/dashboard/(overview)/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardContent from './DashboardContent';
import { prisma } from '@/lib/prisma';
import type { referenciales, User } from '@prisma/client';
import { Suspense } from 'react';

// Tipos mejorados
interface LatestReferencial extends Pick<referenciales, 'id' | 'fechaescritura'> {
  user: Pick<User, 'name'>;
}

interface DashboardError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

// Metadata para SEO
export const metadata = {
  title: 'Panel de Control',
  description: 'Panel de control de Referenciales',
  openGraph: {
    title: 'Panel de Control - Referenciales',
    description: 'Administra tus referencias inmobiliarias'
  }
};

// Componente de error
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-700">{message}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Usar NextAuth para manejar la redirección
    redirect('/api/auth/signin');
  }

  try {
    // Optimizar consulta Prisma con tipo específico
    const latestReferenciales = await prisma.referenciales.findMany({
      take: 5,
      where: {
        userId: session.user.id // Filtrar por usuario actual
      },
      orderBy: { 
        fechaescritura: 'desc' 
      },
      select: {
        id: true,
        fechaescritura: true,
        fojas: true,
        numero: true,
        anio: true,
        cbr: true,
        user: {
          select: { 
            name: true 
          }
        }
      }
    });

    // Validar resultados
    if (!latestReferenciales?.length) {
      return (
        <div className="p-4 text-gray-600">
          No hay referencias disponibles. ¡Comienza agregando una!
        </div>
      );
    }

    // Renderizar dashboard con Suspense
    return (
      <Suspense fallback={<div>Cargando panel de control...</div>}>
        <DashboardContent 
          session={session}
          latestReferenciales={latestReferenciales as LatestReferencial[]}
        />
      </Suspense>
    );

  } catch (error) {
    console.error('[Dashboard Error]:', error);
    
    const dashboardError = error as DashboardError;

    // Manejo de errores específicos
    if (dashboardError.code === 'P2002') {
      return <ErrorMessage message="Error de restricción única en la base de datos." />;
    }
    
    if (dashboardError.code === 'P2025') {
      return <ErrorMessage message="No se encontró el registro solicitado." />;
    }

    if (dashboardError.message?.includes('prisma')) {
      return <ErrorMessage message="Error de conexión con la base de datos." />;
    }

    return <ErrorMessage message="Error al cargar el dashboard. Por favor, intente nuevamente." />;
  }
}