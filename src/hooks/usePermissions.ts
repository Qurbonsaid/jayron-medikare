import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import { hasRouteAccess } from '@/constants/route-permissions';

interface PermissionsResult {
  permissions: Record<
    string,
    {
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }
  >;
  isLoading: boolean;
  canRead: (collectionName: string | null) => boolean;
  isCEO: boolean;
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
    read: '/new-visit', // GET endpoint for viewing new visit form
    create: '/new-visit',
    update: '/examination/:id',
    delete: '/examination/:id',
  },
  examinations: {
    read: '/examinations', // GET endpoint for viewing examinations list
    create: '/examinations',
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
    read: '/lab-order', // GET endpoint for viewing lab orders
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

export const usePermissions = (): PermissionsResult => {
  const { data: userData, isLoading: userLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants | undefined;
  const isCEO = userRole === RoleConstants.CEO;

  // CEO has all permissions
  if (isCEO) {
    return {
      permissions: {},
      isLoading: userLoading,
      canRead: () => true,
      isCEO: true,
    };
  }

  if (!userRole) {
    return {
      permissions: {},
      isLoading: userLoading,
      canRead: () => false,
      isCEO: false,
    };
  }

  // Build permissions object from route-permissions.ts
  const permissions: Record<
    string,
    {
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }
  > = {};

  // Generate permissions for all collections in the mapping
  Object.keys(collectionToRouteMap).forEach((collectionName) => {
    const routes = collectionToRouteMap[collectionName];
    const normalizedName = collectionName.toLowerCase();

    permissions[normalizedName] = {
      canRead: hasRouteAccess(routes.read, userRole, 'GET'),
      canCreate: hasRouteAccess(routes.create, userRole, 'POST'),
      canUpdate: hasRouteAccess(routes.update, userRole, 'PUT'),
      canDelete: hasRouteAccess(routes.delete, userRole, 'DELETE'),
    };
  });

  const canRead = (collectionName: string | null): boolean => {
    if (!collectionName) return true; // permission null bo'lsa, har kim ko'ra oladi
    if (collectionName === 'ceo_only') return false; // faqat CEO ko'ra oladi
    return permissions[collectionName.toLowerCase()]?.canRead ?? false;
  };

  return {
    permissions,
    isLoading: false,
    canRead,
    isCEO: false,
  };
};
