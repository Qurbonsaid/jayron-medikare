import { API_TAGS } from '@/constants/apiTags';
import { baseApi, updateCache } from '../baseApi';
import { PATHS } from './path';
import { LoginRequest, LoginResponse, MeResponse, UpdateMeRequest } from './types';

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
    updateMe: builder.mutation<void, UpdateMeRequest>({
      query: (body) => ({
        url: PATHS.UPDATE_ME, // bu "auth/update-me"
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.USER], // kerak bo‘lsa cache uchun
    }),
  }),
});

export const { useLoginMutation , useMeQuery , useUpdateMeMutation} = authApi;
