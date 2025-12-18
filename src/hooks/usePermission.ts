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
    read: '/add-diagnostika',
    create: '/add-diagnostika',
    update: '/analysisById/:id',
    delete: '/analysisById/:id',
  },
  billing: {
    read: '/billing',
    create: '/billing',
    update: '/billing/:id',
    delete: '/billing/:id',
  },
  inpatient: {
    read: '/inpatient',
    create: '/inpatient',
    update: '/inpatient/:id',
    delete: '/inpatient/:id',
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
  // Additional mappings for Sidebar/router permissions
  prescription: {
    read: '/prescription',
    create: '/prescription',
    update: '/prescription',
    delete: '/prescription',
  },
  diagnosis: {
    read: '/disease',
    create: '/disease',
    update: '/disease/:id',
    delete: '/disease/:id',
  },
  service_type: {
    read: '/service',
    create: '/service',
    update: '/service/:id',
    delete: '/service/:id',
  },
  analysis: {
    read: '/add-diagnostika',
    create: '/add-diagnostika',
    update: '/analysisById/:id',
    delete: '/analysisById/:id',
  },
  patient_analysis: {
    read: '/lab-results',
    create: '/lab-order',
    update: '/lab-results',
    delete: '/lab-results',
  },
  medical_image: {
    read: '/radiology',
    create: '/radiology',
    update: '/radiology',
    delete: '/radiology',
  },
  booking: {
    read: '/inpatient-calendar',
    create: '/inpatient-calendar',
    update: '/inpatient-calendar/:corpusId/:roomId',
    delete: '/inpatient-calendar/:corpusId/:roomId',
  },
  corpus: {
    read: '/inpatient',
    create: '/inpatient',
    update: '/inpatient/:id',
    delete: '/inpatient/:id',
  },
  room: {
    read: '/inpatient',
    create: '/inpatient',
    update: '/room/:id',
    delete: '/room/:id',
  },
  daily_checkup: {
    read: '/daily-checkup',
    create: '/daily-checkup',
    update: '/daily-checkup/:id',
    delete: '/daily-checkup/:id',
  },
  reports: {
    read: '/reports',
    create: '/reports',
    update: '/reports',
    delete: '/reports',
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
