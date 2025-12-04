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
  // API data ni to'g'ridan-to'g'ri object yoki array sifatida qaytarishi mumkin
  const rolePermission = Array.isArray(permissionData.data)
    ? permissionData.data[0]
    : permissionData.data;
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
