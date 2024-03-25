// app/dashboard/referenciales/create/page.tsx

import Form from '@/app/ui/referenciales/create-form';
import Breadcrumbs from '@/app/ui/referenciales/breadcrumbs';
import { fetchColaboradores } from '@/app/lib/colaboradores';

export default async function Page() {
  const colaboradores = await fetchColaboradores();

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
      <Form colaboradores={colaboradores} />
    </main>
  );
}