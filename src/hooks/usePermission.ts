import { useMeQuery } from '@/app/api/authApi/authApi';
import { useGetPermissionByRoleQuery } from '@/app/api/permissionApi/permissionApi';
import { RoleConstants } from '@/constants/Roles';

interface PermissionResult {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

/**
 * Hook to check user permissions for a specific collection/page
 * @param collectionName - The name of the collection to check permissions for (e.g., 'patients', 'disease', 'medicine')
 */
export const usePermission = (collectionName: string): PermissionResult => {
  const { data: userData, isLoading: userLoading } = useMeQuery();
  const userRole = userData?.data?.role;
  const isCEO = userRole === RoleConstants.CEO;

  const { data: permissionData, isLoading: permissionLoading } =
    useGetPermissionByRoleQuery(userRole!, { skip: !userRole || isCEO });

  const isLoading = userLoading || (!isCEO && permissionLoading);

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

  if (isLoading || !permissionData?.data) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      isLoading,
    };
  }

  // Find the permission for this specific collection
  const rolePermission = permissionData.data[0];
  const collectionPermission = rolePermission?.permissions?.find(
    (p) => p.collection_name.toLowerCase() === collectionName.toLowerCase()
  );

  return {
    canCreate: collectionPermission?.create ?? false,
    canRead: collectionPermission?.read ?? false,
    canUpdate: collectionPermission?.update ?? false,
    canDelete: collectionPermission?.delete ?? false,
    isLoading: false,
  };
};
