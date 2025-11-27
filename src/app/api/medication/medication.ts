import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { PATH } from './path';
import {
  MedicationCreated,
  MedicationGetAllReq,
  MedicationGetAllRes,
  MedicationGetByIdRes,
  response,
} from './types';

export const MedicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMedication: builder.mutation<response, MedicationCreated>({
      query: (body) => ({
        url: PATH.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.MEDICATION],
    }),
    getAllMedications: builder.query<MedicationGetAllRes, MedicationGetAllReq>({
      query: (params) => ({
        url: PATH.GET_ALL,
        method: 'GET',
        params,
      }),
      providesTags: [API_TAGS.MEDICATION],
    }),
    getOneMedication: builder.query<MedicationGetByIdRes, { id: string }>({
      query: ({ id }) => ({
        url: PATH.GET_BY_ID + id,
        method: 'GET',
      }),
      providesTags: [API_TAGS.MEDICATION],
    }),

    updateMedication: builder.mutation<
      response,
      { id: string; body: Partial<MedicationCreated> }
    >({
      query: ({ id, body }) => ({
        url: PATH.UPDATE + id,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: [API_TAGS.MEDICATION],
    }),
    deleteMedication: builder.mutation<response, { id: string }>({
      query: ({ id }) => ({
        url: PATH.DELETE + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.MEDICATION],
    }),
  }),
});

export const {
  useCreateMedicationMutation,
  useGetAllMedicationsQuery,
  useGetOneMedicationQuery,
  useUpdateMedicationMutation,
  useDeleteMedicationMutation,
} = MedicationApi;
