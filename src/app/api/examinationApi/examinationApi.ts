import { API_TAGS } from '@/constants/apiTags'
import { CreateExamReq, ExamResponse } from '.'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	AllExamReq,
	AllExamRes,
	createPrescriptionReq,
	MutationRes,
	ExamRes,
	UpdateExamReq,
	updatePrescriptionReq,
	deletePrescriptionReq,
	addImagesRes,
	imageReq,
	reomveimagesRes,
} from './types'

export const examinationApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// exams
		createExam: builder.mutation<ExamResponse, CreateExamReq>({
			query: body => ({
				url: PATHS.CREATE_EXAM,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		getAllExams: builder.query<AllExamRes, AllExamReq>({
			query: params => ({
				url: PATHS.ALL_EXAMS,
				params,
			}),
			providesTags: [API_TAGS.EXAMS, API_TAGS.PRESCRIPTION, API_TAGS.IMAGES],
		}),
		createPrescriptionDays: builder.mutation<
			void,
			{
				id: string
				prescriptionId: string
				data: {
					medication: string
					dosage: number
					frequency: number
					duration: number
					instructions: string
				}
			}
		>({
			query: ({ id, prescriptionId, data }) => ({
				url: `${PATHS.UPDATE_EXAM}${id}/prescription/${prescriptionId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		takeMedicine: builder.mutation<
			void,
			{
				id: string
				prescriptionId: string
				day: string
			}
		>({
			query: ({ id, prescriptionId, day }) => ({
				url: `${PATHS.TAKE_MEDICINE}${id}/prescription/${prescriptionId}/day/${day}`,
				method: 'PATCH',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		getOneExam: builder.query<ExamRes, string>({
			query: id => ({
				url: PATHS.GET_EXAM + id,
			}),
			providesTags: [API_TAGS.EXAMS, API_TAGS.PRESCRIPTION, API_TAGS.IMAGES],
		}),
		deleteExam: builder.mutation<MutationRes, string>({
			query: id => ({
				url: PATHS.DELETE_EXAM + id,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		updateExam: builder.mutation<MutationRes, UpdateExamReq>({
			query: ({ id, body }) => ({
				url: PATHS.UPDATE_EXAM + id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		completeExams: builder.mutation<MutationRes, string>({
			query: id => ({
				url: 'examination/complete/' + id,
				method: 'PATCH',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		// prescriptions

		createPrescription: builder.mutation<MutationRes, createPrescriptionReq>({
			query: ({ id, body }) => ({
				url: PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		updatePrescription: builder.mutation<MutationRes, updatePrescriptionReq>({
			query: ({ id, prescription_id, body }) => ({
				url:
					PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION + prescription_id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		deletePrescription: builder.mutation<MutationRes, deletePrescriptionReq>({
			query: ({ id, prescription_id }) => ({
				url:
					PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION + prescription_id,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),

		// images

		addImages: builder.mutation<addImagesRes, imageReq>({
			query: ({ id, body }) => ({
				url: 'examination/add/' + id + 'images',
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.IMAGES],
		}),
		removeImages: builder.mutation<reomveimagesRes, imageReq>({
			query: ({ id, body }) => ({
				url: 'examination/remove/' + id + 'images',
				method: 'DELETE',
				body,
			}),
			invalidatesTags: [API_TAGS.IMAGES],
		}),

		//complete exams
	}),
})

export const {
	useCreateExamMutation,
	useAddImagesMutation,
	useCompleteExamsMutation,
	useCreatePrescriptionMutation,
	useCreatePrescriptionDaysMutation,
	useDeleteExamMutation,
	useDeletePrescriptionMutation,
	useGetAllExamsQuery,
	useGetOneExamQuery,
	useRemoveImagesMutation,
	useUpdateExamMutation,
	useUpdatePrescriptionMutation,
  useTakeMedicineMutation
} = examinationApi
