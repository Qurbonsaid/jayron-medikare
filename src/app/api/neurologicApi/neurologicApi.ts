import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { MutationRes } from '../examinationApi/types';

const neurologicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNeurologicStatus: builder.mutation<MutationRes,CreateNeurologicStatusReq>({
      query: (body) => ({
        url: 'neurological-status/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.NEUROLOGIC],
    }),
    getAllNeurologicStatus: builder.query<getAllNeurologicStatusRes,getAllNeurologicStatusReq>({
      query: (params) => ({
        url: 'neurological-status/get-all',
        params,
      }),
      providesTags: [API_TAGS.NEUROLOGIC],
    }),
    getOneNeurologicStatus: builder.query<getAllNeurologicStatusRes, string>({
      query: (id) => ({
        url: 'neurological-status/get-one' + id,
      }),
      providesTags: [API_TAGS.NEUROLOGIC],
    }),
    updateNeurologicStatus: builder.mutation<MutationRes,UpdateNeurologicStatusReq>({
      query: (body) => ({
        url: 'neurological-status/update/' + body.id,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.NEUROLOGIC],
    }),
    deleteNeurologicStatus: builder.mutation<MutationRes, string>({
      query: (id) => ({
        url: 'neurological-status/delete/' + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.NEUROLOGIC],
    }),
  }),
});

export const {
  useCreateNeurologicStatusMutation,
  useDeleteNeurologicStatusMutation,
  useGetAllNeurologicStatusQuery,
  useGetOneNeurologicStatusQuery,
  useUpdateNeurologicStatusMutation,
} = neurologicApi;
