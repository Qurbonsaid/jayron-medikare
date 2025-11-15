import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { PATHS } from './path';
import {
  AllPatientReq,
  AllPatientRes,
  CreatePatientReq,
  OnePatientRes,
  PatientRes,
  UpdateReq,
} from './types';

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatient: builder.mutation<PatientRes, CreatePatientReq>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PATIENTS],
    }),
    getAllPatient: builder.query<AllPatientRes, AllPatientReq>({
      query: (param) => ({
        url: PATHS.GET_ALL,
        params: param,
      }),
      providesTags: [API_TAGS.PATIENTS, API_TAGS.EXAMS],
    }),
    getPatientById: builder.query<OnePatientRes, string>({
      query: (id) => ({
        url: PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.PATIENTS, API_TAGS.EXAMS],
    }),
    updatePatient: builder.mutation<PatientRes, UpdateReq>({
      query: ({ body, id }) => ({
        url: PATHS.UPDATE + id,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [API_TAGS.PATIENTS],
    }),
    deletePatient: builder.mutation<PatientRes, string>({
      query: (id) => ({
        url: PATHS.DELETE + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.PATIENTS],
    }),
  }),
});

export const {
  useCreatePatientMutation,
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
