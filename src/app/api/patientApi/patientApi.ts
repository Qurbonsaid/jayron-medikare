import { baseApi } from '../baseApi';
import { PATHS } from './path';
import { AllPatientReq, AllPatientRes, CreatePatientReq, PatientRes } from './types';

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatient: builder.mutation<PatientRes,CreatePatientReq>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: 'POST',
        body,
      }),
    }),
    getAllPatient: builder.query<AllPatientRes,AllPatientReq>({
      query: (param) => ({
        url: PATHS.GET_ALL,
        params:param
      })
    })
  }),
});

export const {useCreatePatientMutation, useGetAllPatientQuery} = patientApi