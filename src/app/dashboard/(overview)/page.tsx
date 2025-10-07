import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';
import DisclaimerPopup from '@/components/ui/dashboard/DisclaimerPopup';
import { prisma } from '@/lib/prisma';
import type { referenciales, User } from '@prisma/client';
import { Suspense } from 'react';

// Tipos mejorados
interface LatestReferencial extends Pick<referenciales, 'id' | 'fechaescritura' | 'createdAt' | 'fojas' | 'numero' | 'anio' | 'cbr'> {
  user: Pick<User, 'name'>;
}

interface DashboardError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

export const metadata = {
  title: 'Panel de Control',
  description: 'Panel de control de Referenciales'
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-700">{message}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // ✅ PERMITIR ACCESO ANÓNIMO - Mostrar contenido limitado si no hay sesión
  // if (!session) {
  //   redirect('/auth/signin');
  // }

  try {
    const [latestReferenciales, totalReferenciales] = await Promise.all([
      prisma.referenciales.findMany({
        take: 5,
        orderBy: { 
          // Ordenamos por fecha de creación, no por fecha de escritura
          createdAt: 'desc' 
        },
        select: {
          id: true,
          fechaescritura: true,
          fojas: true,
          numero: true,
          anio: true,
          cbr: true,
          createdAt: true, // Añadimos createdAt para usar en la UI
          user: {
            select: { 
              name: true 
            }
          }
        }
      }),
      prisma.referenciales.count()
    ]);

    return (
      <>
        <DisclaimerPopup />
        <Suspense fallback={<div>Cargando panel de control...</div>}>
          <DashboardContent 
            session={session}
            latestReferenciales={latestReferenciales}
            totalReferenciales={totalReferenciales}
          />
        </Suspense>
      </>
    );

  } catch (error) {
    console.error('[Dashboard Error]:', error);
    
    const dashboardError = error as DashboardError;

    if (dashboardError.code === 'P2002') {
      return <ErrorMessage message="Error de restricción única en la base de datos." />;
    }
    
    if (dashboardError.code === 'P2025') {
      return <ErrorMessage message="No se encontró el registro solicitado." />;
    }

    return <ErrorMessage message="Error al cargar el dashboard. Por favor, intente nuevamente." />;
  }
}
