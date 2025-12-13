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

  // Examination Routes
  {
    path: '/new-visit',
    name: 'New Examination',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create new examination',
  },
  {
    path: '/examinations',
    name: 'Examinations List',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View examinations list',
  },
  {
    path: '/examination/:id',
    name: 'Examination Detail',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View examination details',
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
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View prescriptions',
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

  // Service Routes
  {
    path: '/service',
    name: 'Services',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View services',
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

  // Lab Routes
  {
    path: '/lab-order',
    name: 'Lab Order',
    method: 'POST',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
    description: 'Create lab order',
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

  // Radiology Routes
  {
    path: '/radiology',
    name: 'Radiology',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View medical images',
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
    path: '/inpatient/:id',
    name: 'Room Management',
    method: 'GET',
    roles: [
      RoleConstants.CEO,
      RoleConstants.ADMIN,
      RoleConstants.DOCTOR,
      RoleConstants.NURSE,
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View room details',
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
      RoleConstants.RECEPTIONIST,
    ],
    description: 'View daily checkups',
  },

  // Billing Routes
  {
    path: '/billing',
    name: 'Billing',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View billing information',
  },

  // Reports Routes
  {
    path: '/reports',
    name: 'Reports',
    method: 'GET',
    roles: [RoleConstants.CEO, RoleConstants.ADMIN],
    description: 'View reports',
  },

  // Settings Routes
  {
    path: '/settings',
    name: 'Settings',
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
      RoleConstants.PHARMACIST,
    ],
    description: 'View user profile',
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

// Helper function to check if user has access to a route
/**
 * Normalize a path by converting URL parameters to route pattern format
 * e.g., '/patient/123' -> '/patient/:id'
 */
const normalizePathPattern = (path: string): string => {
  // If path already has :param pattern, return as is
  if (path.includes(':')) {
    return path;
  }
  // Convert UUID/ID-like segments to :id pattern
  return path.replace(/\/[a-f0-9]{24}(?=\/|$)/gi, '/:id');
};

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
