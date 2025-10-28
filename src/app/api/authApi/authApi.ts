import { API_TAGS } from '@/constants/apiTags';
import { baseApi, updateCache } from '../baseApi';
import { PATHS } from './path';
import { LoginRequest, LoginResponse, MeResponse } from './types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: PATHS.LOGIN,
        method: 'POST',
        body,
      }),
    }),
    me: builder.query<MeResponse, void>({
      query: () => ({
        url: PATHS.ME,
      }),
      providesTags: [API_TAGS.USER],
    }),
  }),
});

export const { useLoginMutation , useMeQuery} = authApi;
