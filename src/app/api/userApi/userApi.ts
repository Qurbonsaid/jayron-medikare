import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { UserCreateResponse } from './types'

// === API Slice ===
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 👇 USER CREATE endpoint
    createUser: builder.mutation<UserCreateResponse, void>({
      query: (body) => ({
        url: PATHS.CREATE, // misol: '/users' yoki '/auth/register'
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // 👇 Agar kerak bo‘lsa — userlarni olish uchun
    // getUsers: builder.query<UserResponse[], void>({
    //   query: () => ({
    //     url: PATHS.USERS,
    //   }),
    //   providesTags: [API_TAGS.USER],
    // }),
  }),
})

export const { useCreateUserMutation } = userApi
