import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import {
  getAccessibleRoutes,
  getRouteRoles,
  hasRouteAccess,
} from '@/constants/route-permissions';

/**
 * Hook to check if user has permission to access a specific route/page
 * @param path - The UI route path (e.g., '/patients', '/examination/:id')
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH) - default GET
 * @returns Object with permission status and allowed roles
 */
export const useRoutePermission = (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
) => {
  const { data: userData, isLoading } = useMeQuery();

  const userRole = userData?.data?.role as RoleConstants;

  // Get allowed roles for this route
  const allowedRoles = getRouteRoles(path, method);

  // If no route found, deny access
  if (allowedRoles.length === 0) {
    return {
      hasPermission: false,
      allowedRoles: [],
      userRole,
      isLoading,
      message: `Route "${path}" not found in permissions or method "${method}" not configured`,
    };
  }

  const hasPermission = hasRouteAccess(path, userRole, method);

  return {
    hasPermission,
    allowedRoles,
    userRole,
    isLoading,
    message: hasPermission
      ? `User has permission to ${method} ${path}`
      : `User role "${userRole}" is not authorized to ${method} ${path}`,
  };
};

export const useRouteActions = (path: string) => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const canCreate = hasRouteAccess(path, userRole, 'POST');
  const canRead = hasRouteAccess(path, userRole, 'GET');
  const canUpdate = hasRouteAccess(path, userRole, 'PUT');
  const canDelete = hasRouteAccess(path, userRole, 'DELETE');
  const canPatch = hasRouteAccess(path, userRole, 'PATCH');

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canPatch,
    userRole,
    isLoading,
  };
};

/**
 * Get all accessible routes (READ access only) for the current user
 */
export const useAccessibleRoutes = () => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const accessibleRoutes = getAccessibleRoutes(userRole).filter(
    (route) => route.method === 'GET'
  );

  return { accessibleRoutes, userRole, isLoading };
};

/**
 * Check if user can perform specific action on a specific route path
 */
export const useRouteAction = (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
) => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const allowedRoles = getRouteRoles(path, method);
  const hasPermission = hasRouteAccess(path, userRole, method);

  return {
    hasPermission,
    allowedRoles,
    userRole,
    isLoading,
  };
};
