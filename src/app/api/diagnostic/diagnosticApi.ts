import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import {
	AnalysisByIdResponse,
	AnalysisParamCreateRequest,
	AnalysisParameter,
	AnalysisResponse,
	CreateAnalysisRequest,
	CreateAnalysisResponse,
	UpdateAnalysisResponse,
} from './types'
import { PATHS } from './path'

export const analysisApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAllDiagnostics: builder.query<AnalysisResponse, void>({
			query: () => ({
				url: PATHS.ANALYSIS_GET_ALL, // backenddagi endpoint yo‘li shu bo‘lishi kerak
				method: 'GET',
			}),
			providesTags: [API_TAGS.ANALYSIS],
		}),

		// CREATE
		createDiagnostic: builder.mutation<
			CreateAnalysisResponse,
			CreateAnalysisRequest
		>({
			query: body => ({
				url: PATHS.ANALYSIS_CREATE,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.ANALYSIS], // yangi tahlil qo‘shilganda getAll refresh bo‘lsin
		}),

		updateDiagnostic: builder.mutation<
			UpdateAnalysisResponse,
			{ id: string; body: CreateAnalysisRequest }
		>({
			query: ({ id, body }) => ({
				url: `${PATHS.ANALYSIS_UPDATE}/${id}`, // endpoint manzilingizga mos o'zgartiring
				method: 'PUT',
				body,
			}),
			invalidatesTags: [API_TAGS.ANALYSIS], // agar caching ishlatilsa
		}),

		deleteDiagnostic: builder.mutation<
			{ success: boolean; message: string },
			string
		>({
			query: id => ({
				url: `${PATHS.ANALYSIS_DELETE}/${id}`, // misol: '/users/:id'
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.ANALYSIS],
		}),

		// 🔹 GET BY ID
    getDiagnosticById: builder.query<AnalysisByIdResponse, string>({
      query: (id) => `${PATHS.ANALYSIS_BY_ID}/${id}`,
      providesTags: [API_TAGS.ANALYSIS],
    }),

		createAnalysisParameter: builder.mutation<void , AnalysisParamCreateRequest>({
      query: ({ analysis_id, parameter_code, parameter_name, unit, normal_range, description }) => ({
        url: PATHS.PARAMETER_CREATE,
        method: 'POST',
        body: {
          analysis_id,
          parameter_code,
          parameter_name,
          unit,
          normal_range,
          description,
        },
      }),
      invalidatesTags: [API_TAGS.ANALYSIS],
    }),
		updateAnalysisParameter: builder.mutation<
		{ success: boolean; message: string; data: AnalysisParameter },
		{ id: string; data: AnalysisParamCreateRequest }
	>({
		query: ({ id, data }) => ({
			url: `${PATHS.PARAMETER_UPDATE}/${id}`,
			method: 'PUT',
			body: data,
		}),
		invalidatesTags: [API_TAGS.ANALYSIS],
	}),
	deleteParameter: builder.mutation<
			{ success: boolean; message: string },
			string
		>({
			query: id => ({
				url: `${PATHS.PARAMETER_DELETE}/${id}`, 
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.ANALYSIS],
		}),
	}),
})

export const {
	useGetAllDiagnosticsQuery,
	useCreateDiagnosticMutation,
	useUpdateDiagnosticMutation,
	useDeleteDiagnosticMutation,
	useGetDiagnosticByIdQuery , 
	useCreateAnalysisParameterMutation ,
	useUpdateAnalysisParameterMutation,
	useDeleteParameterMutation
} = analysisApi
