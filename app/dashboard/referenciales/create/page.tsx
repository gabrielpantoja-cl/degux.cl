import Form from '@/app/ui/referenciales/create-form';
import Breadcrumbs from '@/app/ui/feferenciales/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Referenciales', href: '/dashboard/referenciales' },
          {
            label: 'Create Referencial',
            href: '/dashboard/referenciales/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}