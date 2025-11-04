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
    }),
    getAllPatient: builder.query<AllPatientRes, AllPatientReq>({
      query: (param) => ({
        url: PATHS.GET_ALL,
        params: param,
      }),
    }),
    getPatientById: builder.query<OnePatientRes, string>({
      query: (id) => ({
        url: PATHS.GET_ONE + id,
      }),
    }),
    updatePatient: builder.mutation<PatientRes, UpdateReq>({
      query: ({ body, id }) => ({
        url: PATHS.UPDATE + id,
        method: 'PUT',
        body,
      }),
    }),
    deletePatient: builder.mutation<PatientRes,string>({
      query: (id) => ({
        url: PATHS.DELETE + id,
        method: 'DELETE',
      }),
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
