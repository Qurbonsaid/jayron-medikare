import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { GetAll, Settings } from './types'

export const settingsApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAllSettings: builder.query<GetAll, void>({
			query: () => ({
				url: PATHS.GETALL,
				method: 'POST',
			}),
			providesTags: [API_TAGS.SETTINGS],
		}),
		updateSettings: builder.mutation<void, Settings>({
			query: (body) => ({
				url: PATHS.UPDATE,
				method: 'PUT',
				body
			}),
			invalidatesTags: [API_TAGS.SETTINGS],
		}),
	}),
})

export const { useGetAllSettingsQuery, useUpdateSettingsMutation } = settingsApi
