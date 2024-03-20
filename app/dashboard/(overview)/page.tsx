// app/dashboard/(overview)/page.tsx
import LatestReferenciales from '@/app/ui/dashboard/latest-referenciales';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Home',
};

export default async function Page() {
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    {/* Aquí estaba el CardWrapper */}
                </Suspense>
                {/* <Card title="Collected" value={totalPaidReferenciales} type="collected" />
            <Card title="Pending" value={totalPendingReferenciales} type="pending" />
            <Card title="Total Referenciales" value={numberOfReferenciales} type="Referenciales" />
            <Card
            title="Total Customers"
            value={numberOfCustomers}
            type="customers"
            /> */}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<LatestReferencialesSkeleton />}>
                    <LatestReferenciales />
                </Suspense>
            </div>
        </main>
    );
}