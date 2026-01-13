import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';

export const PrescriptionTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPrecriptionTemplate: builder.mutation<MutationResponse, Template>({
      query: (body) => ({
        url: 'prescription-template/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PRESCRIPTION_TEMPLATE],
    }),

    getAllPrecriptionTemplate: builder.query<GetAllResponse, GetAllParam>({
      query: (params) => ({ url: 'prescription-template/get-all', params }),
      providesTags: [API_TAGS.PRESCRIPTION_TEMPLATE],
    }),

    getPrecriptionTemplateById: builder.query<{ data: GetResponse }, string>({
      query: (id) => ({ url: `prescription-template/get-one/${id}` }),
      providesTags: [API_TAGS.PRESCRIPTION_TEMPLATE],
    }),

    deletePrecriptionTemplate: builder.mutation<MutationResponse, string>({
      query: (id) => ({
        url: `prescription-template/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.PRESCRIPTION_TEMPLATE],
    }),

    updatePrecriptionTemplate: builder.mutation<MutationResponse, UpdateRequest>({
      query: ({ id, body }) => ({
        url: `prescription-template/update/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.PRESCRIPTION_TEMPLATE],
    }),
  }),
});

export const {
  useCreatePrecriptionTemplateMutation,
  useDeletePrecriptionTemplateMutation,
  useGetAllPrecriptionTemplateQuery,
  useGetPrecriptionTemplateByIdQuery,
  useUpdatePrecriptionTemplateMutation,
} = PrescriptionTemplateApi;
