// app/dashboard/(overview)/page.tsx
'use client';
import LatestReferenciales from '@/components/ui/dashboard/latest-referenciales';
import { lusitana } from '@/components/ui/fonts';
import { Suspense } from 'react';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/components/ui/skeletons';
import TopComunasChart from '@/components/ui/dashboard/TopComunasChart';

export default function Page() {
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Inicio
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<LatestReferencialesSkeleton />}>
                    <LatestReferenciales />
                </Suspense>
                <Suspense fallback={<LatestReferencialesSkeleton />}>
                    <TopComunasChart />
                </Suspense>
            </div>
        </main>
    );
}