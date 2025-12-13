/**
 * Role-Based Security (RBS) Module
 *
 * This module provides comprehensive role and permission management based on route-permissions.ts
 *
 * Components:
 * - RBS: Main component for protecting pages and actions
 *
 * Hooks:
 * - useRoutePermission: Check permission for specific route/method
 * - useRouteActions: Get all CRUD permissions for a route
 * - useHasAnyPermission: Check if user has any of specified permissions
 * - useHasAllPermissions: Check if user has all of specified permissions
 * - useAccessibleRoutes: Get all routes user can read
 *
 * Utilities:
 * - getRolePermissionsSummary: Get detailed permission info for a role
 * - getRoleCapabilities: Get human-readable role capabilities
 * - isEndpointAccessible: Check if endpoint exists
 * - getEndpointAllowedRoles: Get roles allowed for an endpoint
 */

export {
  getRoleCapabilities,
  getRolePermissionsSummary,
  useHasAllPermissions,
  useHasAnyPermission,
} from './advancedPermissions';
export { default as RBS } from './Role_Based_Security';
export { useRouteActions, useRoutePermission } from './useRoutePermission';
