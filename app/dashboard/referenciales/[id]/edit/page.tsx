// app/dashboard/referenciales/%5Bid%5D/edit/page.tsx

import Form from '@/app/ui/referenciales/edit-form';
import Breadcrumbs from '@/app/ui/referenciales/breadcrumbs';
import { fetchReferencialById } from '@/app/lib/referenciales';
import { fetchColaboradores } from '@/app/lib/colaboradores';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {

    const id = params.id;
    const referencial: any = await fetchReferencialById(id);
    const colaboradores: any = await fetchColaboradores();

    if (!referencial) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Referenciales', href: '/dashboard/referenciales' },
                    {
                        label: 'Edit Referencial',
                        href: `/dashboard/referenciales/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            {/* Pasamos el primer colaborador al componente Form */}
            <Form referencial={referencial} colaboradores={colaboradores[0]} />
        </main>
    );
}