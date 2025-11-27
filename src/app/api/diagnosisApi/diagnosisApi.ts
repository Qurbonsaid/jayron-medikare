import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { Disease, DiseaseCreateRequest, DiseaseUpdateRequest, getAllDiagnosisReq, getAllDiagnosisRes } from './types'
import { PATHS } from './paths'

export const diseaseApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAllDiagnosis: builder.query<getAllDiagnosisRes, getAllDiagnosisReq>({
			query: params => ({
				url: PATHS.GET_ALL,
				params,
			}),
		}),
		getDiseaseById: builder.query<Disease, string>({
			query: id => `${PATHS.GETONE}/${id}`,
			providesTags: [API_TAGS.DISEASE],
		}),
		createDisease: builder.mutation<Disease, DiseaseCreateRequest>({
			query: data => ({
				url: PATHS.CREATE,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [API_TAGS.DISEASE],
		}),
		updateDisease: builder.mutation<
			Disease,
			{ id: string; data: DiseaseUpdateRequest }
		>({
			query: ({ id, data }) => ({
				url: `${PATHS.UPDATE}/${id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [API_TAGS.DISEASE],
		}),
		deleteDisease: builder.mutation<void, string>({
			query: id => ({
				url: `${PATHS.DELETE}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.DISEASE],
		}),
	}),
})

export const {
	useGetAllDiagnosisQuery,
	useGetDiseaseByIdQuery,
	useCreateDiseaseMutation,
	useUpdateDiseaseMutation,
	useDeleteDiseaseMutation,
} = diseaseApi
