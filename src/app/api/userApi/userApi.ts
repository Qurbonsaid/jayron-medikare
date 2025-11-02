import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { UserCreateResponse, UserGetByIdResponse, UsersGetAll } from './types'

export type GetUsersParams = {
	page?: number
	limit?: number
	search?: string
	role?: string
}

// === API Slice ===
export const userApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// 👇 USER CREATE endpoint
		createUser: builder.mutation<UserCreateResponse, UserCreateResponse>({
			query: body => ({
				url: PATHS.CREATE, // misol: '/users' yoki '/auth/register'
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.USER],
		}),

		// 👇 Agar kerak bo‘lsa — userlarni olish uchun
		getUsers: builder.query<UsersGetAll, GetUsersParams>({
			query: (params = {}) => {
				const queryParams = new URLSearchParams()

				if (params.page != null)
					queryParams.append('page', params.page.toString())
				if (params.limit != null)
					queryParams.append('limit', params.limit.toString())
				if (params.search) queryParams.append('search', params.search)
				if (params.role) queryParams.append('role', params.role)

				const queryString = queryParams.toString()
				return {
					url: queryString ? `${PATHS.GETALL}?${queryString}` : PATHS.GETALL,
				}
			},
			providesTags: [API_TAGS.USER],
		}),

		// 👇 UPDATE USER
		updateUser: builder.mutation<
			UserCreateResponse,
			{ id: string; data: UserCreateResponse }
		>({
			query: ({ id, data }) => ({
				url: `${PATHS.UPDATE}/${id}`, // misol: '/user/update/:id'
				method: 'PUT', // yoki PATCH, sizning backend bilan mos ravishda
				body: data,
			}),
			invalidatesTags: [API_TAGS.USER],
		}),

		getUserById: builder.query<UserGetByIdResponse, string>({
			query: id => ({
				url: `${PATHS.GETBYID}/${id}`,
			}),
			providesTags: [API_TAGS.USER],
		}),

		// 👇 DELETE USER
		deleteUser: builder.mutation<{ success: boolean; message: string }, string>(
			{
				query: id => ({
					url: `${PATHS.DELETE}/${id}`, // misol: '/users/:id'
					method: 'DELETE',
				}),
				invalidatesTags: [API_TAGS.USER],
			}
		),
	}),
})

export const {
	useCreateUserMutation,
	useGetUsersQuery,
	useUpdateUserMutation,
	useGetUserByIdQuery,
  useDeleteUserMutation
} = userApi
