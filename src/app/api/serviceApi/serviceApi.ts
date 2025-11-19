import { API_TAGS } from '@/constants/apiTags';
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
      invalidatesTags: [API_TAGS.SERVICE],
    }),
    getAllService: builder.query<getAllRes, getAllReq>({
      query: (params) => ({
        url: PATHS.GET_ALL,
        params,
      }),
      providesTags: [API_TAGS.SERVICE],
    }),
    getOneService: builder.query<getOneRes, string>({
      query: (id) => ({
        url: PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.SERVICE],
    }),
    updateService: builder.mutation<ServiceRes, updateServiceReq>({
      query: ({ id, body }) => ({
        url: PATHS.UPDATE + id,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [API_TAGS.SERVICE],
    }),
    deleteService: builder.mutation<ServiceRes, string>({
      query: (id) => ({
        url: PATHS.DELETE + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.SERVICE],
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
