import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { GetAllServiceParam, GetAllServiceResponse, GetServiceResponse, ServiceMutationResponse, ServiceTemplate, ServiceUpdateRequest } from './type';

export const ServiceTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createServiceTemplate: builder.mutation<
      ServiceMutationResponse,
      ServiceTemplate
    >({
      query: (body) => ({
        url: 'service-template/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.SERVICE_TEMPLATE],
    }),

    getAllServiceTemplate: builder.query<
      GetAllServiceResponse,
      GetAllServiceParam
    >({
      query: (params) => ({ url: 'service-template/get-all', params }),
      providesTags: [API_TAGS.SERVICE_TEMPLATE],
    }),

    getServiceTemplateById: builder.query<{ data: GetServiceResponse }, string>(
      {
        query: (id) => ({ url: `service-template/get-one/${id}` }),
        providesTags: [API_TAGS.SERVICE_TEMPLATE],
      }
    ),

    deleteServiceTemplate: builder.mutation<ServiceMutationResponse, string>({
      query: (id) => ({
        url: `service-template/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.SERVICE_TEMPLATE],
    }),

    updateServiceTemplate: builder.mutation<
      ServiceMutationResponse,
      ServiceUpdateRequest
    >({
      query: ({ id, body }) => ({
        url: `service-template/update/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.SERVICE_TEMPLATE],
    }),
  }),
});

export const {
  useCreateServiceTemplateMutation,
  useDeleteServiceTemplateMutation,
  useGetAllServiceTemplateQuery,
  useGetServiceTemplateByIdQuery,
  useUpdateServiceTemplateMutation,
} = ServiceTemplateApi;
