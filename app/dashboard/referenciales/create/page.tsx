// app/dashboard/referenciales/create/page.tsx

import Form from '@/components/ui/referenciales/create-form';
import Breadcrumbs from '@/components/ui/referenciales/breadcrumbs';
import { fetchUsers } from '@/lib/users'; // Actualiza la importación para obtener usuarios

export default async function Page() {
  const users = await fetchUsers(); // Utiliza fetchUsers si es necesario

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