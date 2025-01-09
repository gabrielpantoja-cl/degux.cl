// app/dashboard/(overview)/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Dashboard',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirigir a la ruta correcta de autenticación de NextAuth
    redirect('/api/auth/signin');
  }

  try {
    // Obtener datos necesarios en el servidor
    const latestReferenciales = await prisma.referenciales.findMany({
      take: 5,
      orderBy: { fechaescritura: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return (
      <DashboardContent 
        session={session} 
        latestReferenciales={latestReferenciales} 
      />
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return (
      <div>Error cargando el dashboard. Por favor, intente nuevamente.</div>
    );
  }
}