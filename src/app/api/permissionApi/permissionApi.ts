import { API_TAGS } from '@/constants/apiTags';
import { RoleConstants } from '@/constants/Roles';
import { baseApi } from '../baseApi';
import { MutationRes } from '../examinationApi/types';
import { GetAllPermissionsRes, UpdatePermission } from './types';

const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPermission: builder.mutation<MutationRes, RoleConstants>({
      query: (role) => ({
        url: 'permission/create',
        method: 'POST',
        body: { role },
      }),
      invalidatesTags: [API_TAGS.PERMISSION],
    }),
    getAllPermissions: builder.query<GetAllPermissionsRes, void>({
      query: () => ({
        url: 'permission/get-all',
      }),
      providesTags: [API_TAGS.PERMISSION],
    }),
    getPermissionByRole: builder.query<GetAllPermissionsRes, RoleConstants>({
      query: (role) => ({
        url: 'permission/get-one/' + role,
      }),
      providesTags: [API_TAGS.PERMISSION],
    }),
    deletePermission: builder.mutation<MutationRes, string>({
      query: (id) => ({
        url: 'permission/delete/' + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.PERMISSION],
    }),
    updatePermission: builder.mutation<MutationRes, UpdatePermission>({
      query: (permission) => ({
        url: 'permission/update/' + permission.id,
        method: 'PUT',
        body: permission.body,
      }),
      invalidatesTags: [API_TAGS.PERMISSION],
    }),
  }),
});

export const {
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
  useGetAllPermissionsQuery,
  useGetPermissionByRoleQuery,
} = permissionsApi;
