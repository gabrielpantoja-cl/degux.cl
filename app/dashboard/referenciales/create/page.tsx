// app/dashboard/referenciales/create/page.tsx

import Form from '@/components/ui/referenciales/create-form';
import Breadcrumbs from '@/components/ui/referenciales/breadcrumbs';
import { fetchUsers } from '@/lib/users';

export default async function Page() {
  const users = await fetchUsers();
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
      <Form users={users} /> {/* Pasamos la lista de usuarios al componente Form */}
    </main>
  );
}