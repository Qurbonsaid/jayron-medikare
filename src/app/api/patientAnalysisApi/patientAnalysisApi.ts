import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { CreateReq, CreateRes, GetAllPatientAnalysisRes } from './types'

export interface GetAllPatientAnalysisParams {
	page?: number
	limit?: number
	patient_id?: string
	status?: string
	level?: string
	analysis_id?: string
}

export const patientAnalysisApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// CREATE
		createPatientAnalysis: builder.mutation<CreateRes, CreateReq>({
			query:( body )=> ({
				url: PATHS.CREATE,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.ANALYSIS], // yangi tahlil qo‘shilganda getAll refresh bo‘lsin
		}),

		getAllPatientAnalysis: builder.query<GetAllPatientAnalysisRes, GetAllPatientAnalysisParams>({
			query: ({ page = 1, limit = 10, patient_id, status, level, analysis_id }) => {
				const params = new URLSearchParams()
				params.append('page', page.toString())
				params.append('limit', limit.toString())
				if (patient_id) params.append('patient_id', patient_id)
				if (status) params.append('status', status)
				if (level) params.append('level', level)
				if (analysis_id) params.append('analysis_id', analysis_id)

				return {
					url: `${PATHS.GET_ALL}?${params.toString()}`,
					method: 'GET',
				}
			},
			providesTags: [API_TAGS.ANALYSIS],
		}),
	}),
})

export const { useCreatePatientAnalysisMutation , useGetAllPatientAnalysisQuery} = patientAnalysisApi
