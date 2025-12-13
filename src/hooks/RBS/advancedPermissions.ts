import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import {
  RoutePermissions,
  getAccessibleRoutes,
  getRouteRoles,
  hasRouteAccess,
} from '@/constants/route-permissions';

/**
 * Advanced utility functions for permission checking
 * Useful for complex permission scenarios
 */

/**
 * Check if user has any of the specified permissions
 * Useful for conditional rendering based on multiple routes
 */
export const useHasAnyPermission = (
  permissions: Array<{
    path: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  }>
) => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const hasAnyPermission = permissions.some((perm) => {
    return hasRouteAccess(perm.path, userRole, perm.method || 'GET');
  });

  return { hasAnyPermission, userRole, isLoading };
};

/**
 * Check if user has ALL of the specified permissions
 * Useful for features that require multiple permissions
 */
export const useHasAllPermissions = (
  permissions: Array<{
    path: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  }>
) => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const hasAllPermissions = permissions.every((perm) => {
    return hasRouteAccess(perm.path, userRole, perm.method || 'GET');
  });

  return { hasAllPermissions, userRole, isLoading };
};

/**
 * Get all routes that user has read access to
 */
export const useReadableRoutes = () => {
  const { data: userData, isLoading } = useMeQuery();
  const userRole = userData?.data?.role as RoleConstants;

  const readableRoutes = getAccessibleRoutes(userRole).filter(
    (route) => route.method === 'GET'
  );

  return { readableRoutes, userRole, isLoading };
};

/**
 * Get permission details for a specific user role
 * Useful for admin panels showing role capabilities
 */
export const getRolePermissionsSummary = (role: RoleConstants) => {
  const routePermissions = RoutePermissions.filter((route) =>
    route.roles.includes(role)
  ).map((route) => ({
    path: route.path,
    name: route.name,
    method: route.method,
    description: route.description,
  }));

  return routePermissions;
};

/**
 * Get a human-readable description of what a role can do
 */
export const getRoleCapabilities = (role: RoleConstants) => {
  const permissions = getRolePermissionsSummary(role);

  const capabilities = {
    role,
    totalAccessibleRoutes: permissions.length,
    canCreate: permissions.some((p) => p.method === 'POST'),
    canRead: permissions.some((p) => p.method === 'GET'),
    canUpdate: permissions.some(
      (p) => p.method === 'PUT' || p.method === 'PATCH'
    ),
    canDelete: permissions.some((p) => p.method === 'DELETE'),
    routes: Array.from(new Set(permissions.map((p) => p.path))),
  };

  return capabilities;
};

/**
 * Check if a specific route is accessible
 */
export const isRouteAccessible = (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): boolean => {
  const allowedRoles = getRouteRoles(path, method);
  return allowedRoles.length > 0;
};

/**
 * Get all available roles that can access a route
 */
export const getRouteAllowedRoles = (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): RoleConstants[] => {
  return getRouteRoles(path, method);
};
