'use client';

import LatestReferenciales from '@/components/ui/dashboard/latest-referenciales';
import { lusitana } from '@/components/ui/fonts';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/components/ui/skeletons';
import { Session } from 'next-auth';
import ProgressBar from '@/components/ui/dashboard/ProgressBar';

const TopCommunesChart = dynamic(
  () => import('@/components/ui/dashboard/TopComunasChart'),
  { ssr: false }
);

interface DashboardContentProps {
  session: Session;
  latestReferenciales: any[];
  totalReferenciales: number;
}

export default function DashboardContent({ 
  session, 
  latestReferenciales, 
  totalReferenciales 
}: DashboardContentProps) {
  return (
    <main className="flex flex-col space-y-6">
      {/* Breadcrumb */}
      <div className="border-b pb-2">
        <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
          Inicio
        </h1>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col space-y-6">
        {/* Bienvenida */}
        {session?.user && (
          <div className="space-y-2">
            <div className="text-lg text-blue-600">
              👋 ¡Hola! <span className="font-bold">{session.user.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              Cuenta: <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="text-base text-blue-600">
              Bienvenid@ a referenciales.cl
            </div>
          </div>
        )}

        {/* Barra de progreso */}
        <div className="w-full">
          <Suspense fallback={<CardsSkeleton />}>
            <ProgressBar totalReferenciales={totalReferenciales} />
          </Suspense>
        </div>

        {/* Gráficos y referencias */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <Suspense fallback={<LatestReferencialesSkeleton />}>
            <LatestReferenciales data={latestReferenciales} />
          </Suspense>
          <Suspense fallback={<LatestReferencialesSkeleton />}>
            <TopCommunesChart />
          </Suspense>
        </div>
      </div>
    </main>
  );
}