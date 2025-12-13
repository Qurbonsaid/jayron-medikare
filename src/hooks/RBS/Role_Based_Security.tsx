import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import { getRouteRoles, hasRouteAccess } from '@/constants/route-permissions';
import { Loader2 } from 'lucide-react';
import React from 'react';

/**
 * Props for Role-Based Security Component
 *
 * Option 1: Using route-permissions with path (recommended)
 * - path: The UI route path from router.tsx (e.g., '/patients', '/examination/:id')
 * - method: HTTP method to check ('GET', 'POST', 'PUT', 'DELETE', 'PATCH') - default: 'GET'
 *
 * Option 2: Manual role list (legacy)
 * - role: Current user's role
 * - allowed: Array of allowed roles
 */
interface Props {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  deniedFallback?: React.ReactNode;
  // Route-permissions based approach (NEW)
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  // Legacy manual approach
  role?: RoleConstants;
  allowed?: string[];
}

/**
 * Role-Based Security Component
 *
 * Usage with route-permissions (NEW - path-based):
 * <RBS path="/patients" method="GET">
 *   <PatientList />
 * </RBS>
 *
 * <RBS path="/patients" method="POST">
 *   <CreatePatientForm />
 * </RBS>
 *
 * Usage with manual roles (legacy):
 * <RBS role={userRole} allowed={[RoleConstants.ADMIN, RoleConstants.CEO]}>
 *   <AdminPanel />
 * </RBS>
 */
const RBS = ({
  children,
  loadingFallback,
  deniedFallback,
  path,
  method = 'GET',
  role,
  allowed,
}: Props) => {
  const { data: userData, isLoading } = useMeQuery();

  // Show loading state
  if (isLoading) {
    return loadingFallback ? (
      <>{loadingFallback}</>
    ) : (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='w-4 h-4 animate-spin' />
      </div>
    );
  }

  const userRole = userData?.data?.role as RoleConstants;

  // Using route-permissions based approach (NEW)
  if (path) {
    const allowedRoles = getRouteRoles(path, method);

    if (allowedRoles.length === 0) {
      console.warn(
        `🚫 RBS: Path "${path}" with method "${method}" not found in RoutePermissions`
      );
      return deniedFallback ? <>{deniedFallback}</> : null;
    }

    const hasPermission = hasRouteAccess(path, userRole, method);

    if (hasPermission) {
      return <>{children}</>;
    }

    console.warn(
      `🚫 RBS: User role "${userRole}" not authorized for ${method} ${path}`
    );
    return deniedFallback ? <>{deniedFallback}</> : null;
  }

  // Fallback to manual role checking (legacy)
  if (role && allowed) {
    if (allowed.includes(role)) {
      return <>{children}</>;
    }
    return deniedFallback ? <>{deniedFallback}</> : null;
  }

  console.warn(
    '🚫 RBS: No permission criteria provided. Use either path+method or role+allowed.'
  );
  return deniedFallback ? <>{deniedFallback}</> : null;
};

export default RBS;
