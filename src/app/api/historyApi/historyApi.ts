import { baseApi } from '../baseApi';
import {
  GetAllHistoryRequest,
  GetAllHistoryResponse,
  GetOneHistoryResponse,
} from './types';

export const historyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllHistory: builder.query<GetAllHistoryResponse, GetAllHistoryRequest>({
      query: (params) => ({
        url: '/history/get-all',
        params,
      }),
    }),
    getOneHistory: builder.query<GetOneHistoryResponse, string>({
      query: (id) => ({
        url: `/history/get-one/${id}`,
      }),
    }),
  }),
});

export const { useGetAllHistoryQuery, useGetOneHistoryQuery } = historyApi;
