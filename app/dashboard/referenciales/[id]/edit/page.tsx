import Form from '@/app/ui/referenciales/edit-form';
import Breadcrumbs from '@/app/ui/referenciales/breadcrumbs';
import { fetchCustomers, fetchReferencialById } from '@/app/lib/data';
import { CustomerField, ReferencialForm } from '@/app/lib/definitions';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {

    const id = params.id;
    const [referencial, customers]: [ReferencialForm | undefined, CustomerField[] | undefined] = await Promise.all([
        fetchReferencialById(id),
        fetchCustomers(),
    ]);

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
            <Form referencial={referencial!} customers={customers} />
        </main>
    );
}