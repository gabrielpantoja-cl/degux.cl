// app/dashboard/(overview)/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Home',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Obtener datos necesarios en el servidor
  const latestReferenciales = await prisma.referenciales.findMany({
    take: 5,
    orderBy: { fechaescritura: 'desc' }, // Cambiado a fechaescritura según el esquema de Prisma
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
}