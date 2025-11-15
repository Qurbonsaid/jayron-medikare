import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	CreateReq,
	CreateRes,
	Filters,
	GetAllPatientAnalysisRes,
	GetByIdRes,
	UpdateReq,
	UpdateRes,
} from './types'

export interface GetAllPatientAnalysisParams {
	page?: number
	limit?: number
	patient?: string
	status?: string
	level?: string
	analysis_type?: string
}

export const patientAnalysisApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// CREATE
		createPatientAnalysis: builder.mutation<CreateRes, CreateReq>({
			query: body => ({
				url: PATHS.CREATE,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.ANALYSIS], // yangi tahlil qo‘shilganda getAll refresh bo‘lsin
		}),

		getAllPatientAnalysis: builder.query<GetAllPatientAnalysisRes, Filters>({
			query: ({
				page = 1,
				limit = 10,
				patient,
				status,
				level,
				analysis_type,
			}) => {
				const params = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString(),
				})
				if (patient) params.append('patient', patient)
				if (status) params.append('status', status)
				if (level) params.append('level', level)
				if (analysis_type) params.append('analysis_type', analysis_type)

				return {
					url: `${PATHS.GET_ALL}?${params.toString()}`,
					method: 'GET',
				}
			},
			providesTags: [API_TAGS.ANALYSIS],
		}),

		getPatientAnalysisById: builder.query<GetByIdRes, string>({
			query: id => ({
				url: `${PATHS.GET_BYID}/${id}`,
				providesTags: [API_TAGS.ANALYSIS],
			}),
		}),
		updatePatientAnalysis: builder.mutation<UpdateRes, { id: string; body: UpdateReq }>(
      {
        query: ({ id, body }) => ({
          url: `${PATHS.UPDATE}/${id}`, // e.g. PATHS.PATIENT_ANALYSIS_UPDATE = 'patient-analysis/update'
          method: 'PUT',
          body,
					
        }),
        invalidatesTags: [API_TAGS.ANALYSIS], // agar kerak bo'lsa
      }
    ),
	}),
})

export const {
	useCreatePatientAnalysisMutation,
	useGetAllPatientAnalysisQuery,
	useGetPatientAnalysisByIdQuery,
	useUpdatePatientAnalysisMutation
} = patientAnalysisApi
