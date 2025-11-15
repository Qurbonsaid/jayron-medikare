import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { PATHS } from './path';
import {
  AllRes,
  CreateBillingReq,
  GetAllBillingReq,
  GetAllBillingRes,
  GetOneBillingRes,
  MutationRes,
  UpdatePayment,
  UpdateService,
} from './types';

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBilling: builder.mutation<AllRes, CreateBillingReq>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.BILLING],
    }),
    getOneBilling: builder.query<GetOneBillingRes, string>({
      query: (id) => ({
        url: PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.BILLING],
    }),
    getAllBilling: builder.query<GetAllBillingRes, GetAllBillingReq>({
      query: (params) => ({
        url: PATHS.GET_ALL,
        params,
      }),
      providesTags: [API_TAGS.BILLING],
    }),
    updateService: builder.mutation<MutationRes, UpdateService>({
      query: ({ id, body }) => ({
        url: PATHS.SERVICE_UPDATE + id,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.BILLING],
    }),
    updatePayment: builder.mutation<MutationRes, UpdatePayment>({
      query: ({ id, body }) => ({
        url: PATHS.PAYMENT_UPDATE + id,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.BILLING],
    }),
    deleteBilling: builder.mutation<MutationRes, string>({
      query: (id) => ({
        url: PATHS.SERVICE_UPDATE + id,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.BILLING],
    }),
  }),
});

export const {
  useCreateBillingMutation,
  useGetAllBillingQuery,
  useGetOneBillingQuery,
  useUpdatePaymentMutation,
  useUpdateServiceMutation,
  useDeleteBillingMutation,
} = billingApi;
