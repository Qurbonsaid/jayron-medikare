import { RoleConstants } from '@/constants/Roles';

interface GetAllPermissionsRes {
  success: boolean;
  data: Array<{
    _id: string;
    role: RoleConstants;
    permissions: Array<{
      _id: string;
      collection_name: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }>;
    created_at: Date;
    updated_at: Date;
  }>;
}

interface UpdatePermission {
  id: string;
  body: {
    permissions: Array<{
      _id: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }>;
  };
}
