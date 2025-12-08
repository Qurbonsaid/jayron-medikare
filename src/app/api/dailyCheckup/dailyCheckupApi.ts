import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	DailyCheckupFilter,
	DailyCheckupGetAll,
	Entry,
	GetOneDailyCheckup,
} from './types'

interface CreateDailyCheckupPayload extends Entry {
	examination_id: string
}

export const dailyCheckupApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAlldailyCheckup: builder.query<DailyCheckupGetAll, DailyCheckupFilter>({
			query: ({
				page = 1,
				limit = 100,
				patient_id,
				doctor_id,
				examination_status,
			}) => {
				const params = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString(),
				})
				if (patient_id) params.append('patient_id', patient_id)
				if (doctor_id) params.append('doctor_id', doctor_id)
				if (examination_status)
					params.append('examination_status', examination_status)
				return {
					url: `${PATHS.DAILY_CHECKUP_GET_ALL}?${params.toString()}`,
					method: 'GET',
				}
			},
			providesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		getOneDailyCheckup: builder.query<GetOneDailyCheckup, string>({
			query: id => ({
				url: PATHS.DAILY_CHECKUP_GET_ONE + id,
				method: 'GET',
			}),
			providesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		createDailyCheckup: builder.mutation<Response, CreateDailyCheckupPayload>({
			query: body => ({
				url: PATHS.DAILY_CHECKUP_CREATE,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		addEntryDailyCheckup: builder.mutation<
			Response,
			{ id: string; body: Entry }
		>({
			query: ({ id, body }) => ({
				url: PATHS.DAILY_CHECKUP_ADD_ENTRY + id,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		deleteDailyCheckup: builder.mutation<
			Response,
			{ id: string; entry_id: string }
		>({
			query: ({ id, entry_id }) => ({
				url: PATHS.DAILY_CHECKUP_DELETE_ENTRY + id + '/' + entry_id,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.DAILY_CHECKUP],
		}),
	}),
})

export const {
	useGetAlldailyCheckupQuery,
	useGetOneDailyCheckupQuery,
	useCreateDailyCheckupMutation,
	useAddEntryDailyCheckupMutation,
	useDeleteDailyCheckupMutation,
} = dailyCheckupApi
