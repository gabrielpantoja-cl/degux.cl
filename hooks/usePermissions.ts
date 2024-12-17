// /hooks/usePermissions.ts
import { useSession } from 'next-auth/react';

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canView: boolean;
}

export function usePermissions(): Permissions {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || 'USER';
  
  // Definir permisos basados en roles
  const permissions: Permissions = {
    canEdit: false,
    canDelete: false,
    canCreate: false,
    canView: true,
  };

  switch (userRole) {
    case 'ADMIN':
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canCreate = true;
      break;
    case 'EDITOR':
      permissions.canEdit = true;
      permissions.canCreate = true;
      break;
    case 'USER':
      permissions.canView = true;
      break;
    default:
      break;
  }

  return permissions;
}