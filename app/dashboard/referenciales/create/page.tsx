// app/dashboard/referenciales/create/page.tsx

import Form from '@/app/ui/referenciales/create-form';
import Breadcrumbs from '@/app/ui/referenciales/breadcrumbs';
// import { fetchColaboradores } from '@/app/lib/colaboradores';

export default function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Referenciales', href: '/dashboard/referenciales' },
          {
            label: 'Crear Referencial',
            href: '/dashboard/referenciales/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}