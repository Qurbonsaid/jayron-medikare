import { useMeQuery } from '@/app/api/authApi/authApi';
import { useGetPermissionByRoleQuery } from '@/app/api/permissionApi/permissionApi';
import { RoleConstants } from '@/constants/Roles';

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

export const usePermissions = (): PermissionsResult => {
  const { data: userData, isLoading: userLoading } = useMeQuery();
  const userRole = userData?.data?.role;
  const isCEO = userRole === RoleConstants.CEO;

  const { data: permissionData, isLoading: permissionLoading } =
    useGetPermissionByRoleQuery(userRole!, { skip: !userRole || isCEO });

  const isLoading = userLoading || (!isCEO && permissionLoading);

  // CEO has all permissions
  if (isCEO) {
    return {
      permissions: {},
      isLoading: userLoading,
      canRead: () => true,
      isCEO: true,
    };
  }

  if (isLoading || !permissionData?.data) {
    return {
      permissions: {},
      isLoading,
      canRead: () => false,
      isCEO: false,
    };
  }

  // API data ni to'g'ridan-to'g'ri object yoki array sifatida qaytarishi mumkin
  const rolePermission = Array.isArray(permissionData.data)
    ? permissionData.data[0]
    : permissionData.data;
  const permissions: Record<
    string,
    {
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }
  > = {};

  rolePermission?.permissions?.forEach((p) => {
    permissions[p.collection_name.toLowerCase()] = {
      canRead: p.read ?? false,
      canCreate: p.create ?? false,
      canUpdate: p.update ?? false,
      canDelete: p.delete ?? false,
    };
  });

  const canRead = (collectionName: string | null): boolean => {
    if (!collectionName) return true; // permission null bo'lsa, har kim ko'ra oladi
    if (collectionName === 'ceo_only') return false; // faqat CEO ko'ra oladi
    return permissions[collectionName.toLowerCase()]?.canRead ?? false;
  };

  return {
    permissions,
    isLoading,
    canRead,
    isCEO: false,
  };
};
