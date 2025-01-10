// app/dashboard/(overview)/DashboardContent.tsx
'use client';

import LatestReferenciales from '@/components/ui/dashboard/latest-referenciales';
import { lusitana } from '@/components/ui/fonts';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/components/ui/skeletons';
import { Session } from 'next-auth';

const TopCommunesChart = dynamic(
  () => import('@/components/ui/dashboard/TopComunasChart'),
  { ssr: false }
);

interface DashboardContentProps {
  session: Session;
  latestReferenciales: any[];
}

export default function DashboardContent({ session, latestReferenciales }: DashboardContentProps) {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Inicio
      </h1>
      {session?.user && (
        <div className="mb-4 space-y-2">
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<LatestReferencialesSkeleton />}>
          <LatestReferenciales data={latestReferenciales} />
        </Suspense>
        <Suspense fallback={<LatestReferencialesSkeleton />}>
          <TopCommunesChart />
        </Suspense>
      </div>
    </main>
  );
}