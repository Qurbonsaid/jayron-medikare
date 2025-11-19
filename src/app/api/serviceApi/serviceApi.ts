import { baseApi } from '../baseApi';
import { PATHS } from './path';

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createService: builder.mutation<ServiceRes, createServiceReq>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: 'POST',
        body,
      }),
    }),
    getAllService: builder.query<getAllRes, getAllReq>({
      query: (params) => ({
        url: PATHS.GET_ALL,
        params,
      }),
    }),
    getOneService: builder.query<getOneRes, string>({
      query: (id) => ({
        url: PATHS.GET_ONE + id,
      }),
    }),
    updateService: builder.mutation<ServiceRes, updateServiceReq>({
      query: ({ id, body }) => ({
        url: PATHS.UPDATE + id,
        method: 'PUT',
        body,
      }),
    }),
    deleteService: builder.mutation<ServiceRes, string>({
      query: (id) => ({
        url: PATHS.DELETE + id,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetAllServiceQuery,
  useGetOneServiceQuery,
  useUpdateServiceMutation,
} = serviceApi;
