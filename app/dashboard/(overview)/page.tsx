// app/dashboard/(overview)/page.tsx
import LatestReferenciales from '@/components/ui/dashboard/latest-referenciales';
import { lusitana } from '@/components/ui/fonts';
import { Suspense } from 'react';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/components/ui/skeletons';
import TopComunasChart from '@/components/ui/dashboard/TopComunasChart';
import { db } from "@/lib/db";

export default async function Page() {
    const latestReferenciales = await db.referenciales.findMany({
        select: {
            id: true,
            lat: true,
            lng: true,
            fojas: true,
            numero: true,
            anio: true,
            cbr: true,
            comprador: true,
            vendedor: true,
            predio: true,
            comuna: true,
            rol: true,
            fechaescritura: true,
            superficie: true,
            monto: true,
            observaciones: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    password: true,
                    emailVerified: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5
    });
    // Agrupar y contar las comunas desde la tabla referenciales
    const topComunas = await db.referenciales.groupBy({
        by: ['comuna'],
        _count: {
            comuna: true,
        },
        orderBy: {
            _count: {
                comuna: 'desc',
            },
        },
        take: 10, // Limitar a las top 10 comunas
    });

    // Transformar los datos para que coincidan con la estructura esperada por el componente
    const topComunas = await db.referenciales.groupBy({
        by: ['comuna'],
        _count: {
            comuna: true,
        },
        orderBy: {
            _count: {
                comuna: 'desc',
            },
        },
        take: 10,
    });

    const topComunasData = topComunas.map(item => ({
        comuna: item.comuna,
        count: item._count.comuna,
    }));

    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Inicio
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    {/* Renderiza componentes con datos obtenidos */}
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<LatestReferencialesSkeleton />}>
                    <LatestReferenciales data={latestReferenciales} />
                </Suspense>
                <Suspense fallback={<LatestReferencialesSkeleton />}>
                    <TopComunasChart data={topComunasData} />
                </Suspense>
            </div>
        </main>
    );
}