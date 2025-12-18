import { RoleConstants } from './Roles';

export interface RoutePermission {
  path: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  roles: RoleConstants[];
  description?: string;
}

export const RoutePermissions: RoutePermission[] = [
  // Patient Routes
  {
    path: '/patients',
    name: 'Patients List',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View patients list',
  },
  {
    path: '/patients',
    name: 'Create Patient',
    method: 'POST',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'Create new patient',
  },

  {
    path: '/patient/:id',
    name: 'Patient Profile',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View patient profile',
  },
  {
    path: '/patient/:id',
    name: 'Update Patient',
    method: 'PUT',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'Update patient profile',
  },
  {
    path: '/patient/:id',
    name: 'Delete Patient',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete patient',
  },

  // Examination Routes
  {
    path: '/new-visit',
    name: 'New Examination',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create new examination',
  },
  {
    path: '/new-visit',
    name: 'View New Examination',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'View new examination form',
  },
  {
    path: '/examinations',
    name: 'Examinations List',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View examinations list',
  },
  {
    path: '/examination/:id',
    name: 'Examination Detail',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View examination details',
  },
  {
    path: '/examination/:id',
    name: 'Update Examination',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update examination',
  },
  {
    path: '/examination/:id',
    name: 'Delete Examination',
    method: 'DELETE',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'Delete examination',
  },

  // Appointments Routes
  {
    path: '/appointments',
    name: 'Appointments',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View appointments',
  },

  // Prescription Routes
  {
    path: '/prescription',
    name: 'Prescription',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View prescriptions',
  },
  {
    path: '/prescription',
    name: 'Create Prescription',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create prescription',
  },

  // Diagnosis/Disease Routes
  {
    path: '/disease',
    name: 'Diseases',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View diseases/diagnosis',
  },
  {
    path: '/disease',
    name: 'Create Disease',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create disease',
  },
  {
    path: '/disease/:id',
    name: 'Update Disease',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update disease',
  },
  {
    path: '/disease/:id',
    name: 'Delete Disease',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete disease',
  },

  // Medication Routes
  {
    path: '/medication',
    name: 'Medications',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.PHARMACIST,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View medications',
  },
  {
    path: '/medication',
    name: 'Create Medication',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create medication',
  },
  {
    path: '/medication/:id',
    name: 'Update Medication',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update medication',
  },
  {
    path: '/medication/:id',
    name: 'Delete Medication',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete medication',
  },

  // Service Routes
  {
    path: '/service',
    name: 'Services',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View services',
  },
  {
    path: '/service',
    name: 'Create Service',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create service',
  },
  {
    path: '/service/:id',
    name: 'Update Service',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update service',
  },
  {
    path: '/service/:id',
    name: 'Delete Service',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete service',
  },

  // Diagnostics Routes
  {
    path: '/add-diagnostika',
    name: 'Add Diagnostics',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Add diagnostics',
  },
  {
    path: '/add-diagnostika',
    name: 'View Diagnostics Form',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'View diagnostics form',
  },
  {
    path: '/analysisById/:id',
    name: 'Analysis Parameters',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View analysis parameters',
  },

  {
    path: '/analysisById/:id',
    name: 'Analysis Parameters',
    method: 'POST',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View analysis parameters',
  },
  {
    path: '/analysisById/:id',
    name: 'Update Analysis',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update analysis',
  },

  // Lab Routes
  {
    path: '/lab-order',
    name: 'Lab Order',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create lab order',
  },
  {
    path: '/lab-order',
    name: 'View Lab Orders',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'View lab orders',
  },
  {
    path: '/lab-results',
    name: 'Lab Results',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View lab results',
  },
  {
    path: '/lab-results',
    name: 'Update Lab Result',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update lab result',
  },

  // Radiology Routes
  {
    path: '/radiology',
    name: 'Radiology',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'View medical images',
  },
  {
    path: '/radiology',
    name: 'Upload Radiology',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Upload medical images',
  },
  {
    path: '/radiology',
    name: 'Update Radiology',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update medical image',
  },
  {
    path: '/radiology',
    name: 'Delete Radiology',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete medical image',
  },

  // Inpatient Routes
  {
    path: '/inpatient',
    name: 'Inpatient Management',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View inpatient list',
  },
  {
    path: '/inpatient',
    name: 'Create Inpatient',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create inpatient',
  },
  {
    path: '/inpatient/:id',
    name: 'View Inpatient Rooms',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View rooms for inpatient',
  },
  {
    path: '/inpatient/:id',
    name: 'Update Inpatient',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update inpatient',
  },
  {
    path: '/inpatient/:id',
    name: 'Delete Inpatient',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete inpatient',
  },
  {
    path: '/inpatient-calendar',
    name: 'Inpatient Calendar',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View inpatient calendar',
  },
  {
    path: '/inpatient-calendar/:corpusId/:roomId',
    name: 'Room Calendar',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View room calendar',
  },
  {
    path: '/room/:id',
    name: 'Room Detail',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View room detail',
  },
  {
    path: '/room/:id',
    name: 'Update Room',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update room',
  },
  {
    path: '/room/:id',
    name: 'Delete Room',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete room',
  },

  // Medicine Routes
  {
    path: '/medicine',
    name: 'Medicine Management',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.PHARMACIST,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View medicine inventory',
  },
  {
    path: '/medicine',
    name: 'Create Medicine',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.PHARMACIST],
    description: 'Create medicine',
  },
  {
    path: '/medicine/:id',
    name: 'Update Medicine',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.PHARMACIST],
    description: 'Update medicine',
  },
  {
    path: '/medicine/:id',
    name: 'Delete Medicine',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete medicine',
  },

  // Daily Checkup Routes
  {
    path: '/daily-checkup',
    name: 'Daily Checkup',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
    ],
    description: 'View daily checkups',
  },
  {
    path: '/daily-checkup',
    name: 'Create Daily Checkup',
    method: 'POST',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
    ],
    description: 'Create daily checkup',
  },
  {
    path: '/daily-checkup/:id',
    name: 'Update Daily Checkup',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Update daily checkup',
  },
  {
    path: '/daily-checkup/:id',
    name: 'Delete Daily Checkup',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete daily checkup',
  },

  // Billing Routes
  {
    path: '/billing',
    name: 'Billing',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View billing information',
  },
  {
    path: '/billing',
    name: 'Create Billing',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Create billing record',
  },
  {
    path: '/billing/:id',
    name: 'Update Billing',
    method: 'PUT',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Update billing',
  },
  {
    path: '/billing/:id',
    name: 'Delete Billing',
    method: 'DELETE',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Delete billing',
  },

  // Reports Routes
  {
    path: '/reports',
    name: 'Reports',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View reports',
  },
  {
    path: '/reports',
    name: 'Generate Report',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'Generate report',
  },

  // Settings Routes
  {
    path: '/settings',
    name: 'Settings',
    method: 'GET',
    roles: [RoleConstants.CEO],
    description: 'View settings',
  },
  {
    path: '/settings',
    name: 'Update Settings',
    method: 'PUT',
    roles: [RoleConstants.CEO],
    description: 'Manage system settings',
  },

  // Profile Routes (Public)
  {
    path: '/profile',
    name: 'Profile',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View user profile',
  },
  {
    path: '/profile',
    name: 'Update Profile',
    method: 'PUT',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'Update user profile',
  },

  // Patient Portal (Public)
  {
    path: '/patient-portal',
    name: 'Patient Portal',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
      RoleConstants.PHARMACIST,
    ],
    description: 'Patient portal access',
  },
];

/**
 * Check if a path matches a route pattern
 * e.g., matchesRoutePattern('/patient/:id', '/patient/123') -> true
 * Also handles: matchesRoutePattern('/patient/:id', '/patient/:id') -> true
 */
const matchesRoutePattern = (pattern: string, path: string): boolean => {
  // Direct match (both are patterns or both are exact)
  if (pattern === path) {
    return true;
  }

  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    // If pattern part is a parameter like :id, it matches any path part
    if (part.startsWith(':')) {
      return true;
    }
    // Otherwise, must match exactly
    return part === pathParts[index];
  });
};

export const getRouteRoles = (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): RoleConstants[] => {
  // Try to find matching route
  const route = RoutePermissions.find(
    (r) =>
      (r.path === path || matchesRoutePattern(r.path, path)) &&
      r.method === method
  );

  return route?.roles || [];
};

// Helper function to check if a specific role has access to a route
export const hasRouteAccess = (
  path: string,
  role: RoleConstants,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): boolean => {
  const allowedRoles = getRouteRoles(path, method);
  return allowedRoles.includes(role);
};

// Get all routes accessible by a specific role
export const getAccessibleRoutes = (role: RoleConstants): RoutePermission[] => {
  return RoutePermissions.filter((route) => route.roles.includes(role));
};

// Get route by path
export const getRoute = (path: string): RoutePermission | undefined => {
  return RoutePermissions.find((r) => r.path === path);
};
