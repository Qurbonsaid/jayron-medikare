import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import { hasRouteAccess } from '@/constants/route-permissions';

interface PermissionResult {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

// Collection name to route path mapping
const collectionToRouteMap: Record<
  string,
  { read: string; create: string; update: string; delete: string }
> = {
  patients: {
    read: '/patients',
    create: '/patients',
    update: '/patient/:id',
    delete: '/patient/:id',
  },
  patient: {
    read: '/patients',
    create: '/patients',
    update: '/patient/:id',
    delete: '/patient/:id',
  },
  examination: {
    read: '/examinations',
    create: '/new-visit',
    update: '/examination/:id',
    delete: '/examination/:id',
  },
  medication: {
    read: '/medication',
    create: '/medication',
    update: '/medication/:id',
    delete: '/medication/:id',
  },
  disease: {
    read: '/disease',
    create: '/disease',
    update: '/disease/:id',
    delete: '/disease/:id',
  },
  service: {
    read: '/service',
    create: '/service',
    update: '/service/:id',
    delete: '/service/:id',
  },
  diagnostic: {
    read: '/diagnostic',
    create: '/diagnostic',
    update: '/diagnostic/:id',
    delete: '/diagnostic/:id',
  },
  billing: {
    read: '/billing',
    create: '/billing',
    update: '/billing/:id',
    delete: '/billing/:id',
  },
  inpatient: {
    read: '/rooms',
    create: '/rooms',
    update: '/room/:id',
    delete: '/room/:id',
  },
  appointments: {
    read: '/appointments',
    create: '/appointments',
    update: '/appointments/:id',
    delete: '/appointments/:id',
  },
  permissions: {
    read: '/settings',
    create: '/settings',
    update: '/settings',
    delete: '/settings',
  },
};

export const usePermission = (collectionName: string): PermissionResult => {
  const { data: userData, isLoading: userLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants | undefined;
  const isCEO = userRole === RoleConstants.CEO;

  // CEO has all permissions
  if (isCEO) {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      isLoading: userLoading,
    };
  }

  if (!userRole) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      isLoading: userLoading,
    };
  }

  // Get route paths for this collection
  const normalizedCollectionName = collectionName.toLowerCase();
  const routes = collectionToRouteMap[normalizedCollectionName];

  if (!routes) {
    // If collection not found in mapping, deny all permissions
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      isLoading: false,
    };
  }

  // Check permissions using route-permissions.ts
  const canRead = hasRouteAccess(routes.read, userRole, 'GET');
  const canCreate = hasRouteAccess(routes.create, userRole, 'POST');
  const canUpdate = hasRouteAccess(routes.update, userRole, 'PUT');
  const canDelete = hasRouteAccess(routes.delete, userRole, 'DELETE');

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isLoading: false,
  };
};
