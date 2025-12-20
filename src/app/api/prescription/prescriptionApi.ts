import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	createPrescriptionReq,
	GetAllPresc,
	GetOnePresc,
	MutationRes,
	takePresc,
	updatePrescriptionReq,
} from './types'

export const Pagination = {
	page: 1,
	limit: 100,
	patient_id: '',
	doctor_id: '',
	examination_status: '',
	is_roomed: '',
}

export const prescriptionApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// prescriptions
		getAllPrescriptions: builder.query<GetAllPresc, Pagination>({
			query: () => ({
				url:
					PATHS.GET_ALL +
					`?page=${Pagination.page}&limit=${Pagination.limit}&patient_id=${Pagination.patient_id}&doctor_id=${Pagination.doctor_id}&examination_status=${Pagination.examination_status}&is_roomed=${Pagination.is_roomed}`,
				method: 'GET',
			}),
			providesTags: [API_TAGS.PRESCRIPTION],
		}),
		getOnePrescription: builder.query<GetOnePresc, string>({
			query: id => ({
				url: PATHS.GET_ONE + id,
				method: 'GET',
			}),
			providesTags: [API_TAGS.PRESCRIPTION],
		}),
		createPrescription: builder.mutation<MutationRes, createPrescriptionReq>({
			query: body => ({
				url: PATHS.CREATE,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		updatePrescription: builder.mutation<MutationRes, updatePrescriptionReq>({
			query: ({ id, body }) => ({
				url: PATHS.UPDATE + id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		takePrescription: builder.mutation<void, takePresc>({
			query: ({ id, body }) => ({
				url: `${PATHS.TAKE_UPDATE}${id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
	}),
})

export const {
	useGetAllPrescriptionsQuery,
	useGetOnePrescriptionQuery,
	useCreatePrescriptionMutation,
	useUpdatePrescriptionMutation,
	useTakePrescriptionMutation,
} = prescriptionApi
