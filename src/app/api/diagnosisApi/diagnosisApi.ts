import { baseApi } from '../baseApi';
import { PATHS } from './paths';

export const diagnosis = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDiagnosis: builder.query<getAllDiagnosisRes, getAllDiagnosisReq>({
      query: (params) => ({
        url: PATHS.GET_ALL,
        params,
      }),
    }),
  }),
});

export const { useGetAllDiagnosisQuery } = diagnosis;
