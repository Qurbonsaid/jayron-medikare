import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	DailyCheckupFilter,
	DailyCheckupGetAll,
	Entry,
	GetOneDailyCheckup,
	UncheckedPatientsResponse,
} from './types'

interface CreateDailyCheckupPayload {
	patient_id: string
	nurse_id: string
	room_id: string
	result: {
		systolic: number
		diastolic: number
	}
	notes?: string
}

export const dailyCheckupApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAlldailyCheckup: builder.query<DailyCheckupGetAll, DailyCheckupFilter>({
			query: ({
				page = 1,
				limit = 100,
				patient_id,
				doctor_id,
				room_id,
				search,
				current_date,
				examination_status,
			}) => {
				const params = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString(),
				})
				if (patient_id) params.append('patient_id', patient_id)
				if (doctor_id) params.append('doctor_id', doctor_id)
				if (room_id) params.append('room_id', room_id)
				if (search) params.append('search', search)
				if (current_date) params.append('current_date', current_date)
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
			string
		>({
			query: (id) => ({
				url: PATHS.DAILY_CHECKUP_DELETE + id,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		updateDailyCheckup: builder.mutation<
			Response,
			{ id: string; body: { result?: { systolic: number; diastolic: number }; notes?: string } }
		>({
			query: ({ id, body }) => ({
				url: PATHS.DAILY_CHECKUP_UPDATE + id,
				method: 'PUT',
				body,
			}),
			invalidatesTags: [API_TAGS.DAILY_CHECKUP],
		}),
		getUncheckedPatients: builder.query<UncheckedPatientsResponse, void>({
			query: () => ({
				url: PATHS.DAILY_CHECKUP_UNCHECKED_PATIENTS,
				method: 'GET',
			}),
			providesTags: [API_TAGS.DAILY_CHECKUP],
		}),
	}),
})

export const {
	useGetAlldailyCheckupQuery,
	useGetOneDailyCheckupQuery,
	useCreateDailyCheckupMutation,
	useAddEntryDailyCheckupMutation,
	useDeleteDailyCheckupMutation,
	useUpdateDailyCheckupMutation,
	useGetUncheckedPatientsQuery,
} = dailyCheckupApi
