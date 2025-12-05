import { API_TAGS } from '@/constants/apiTags'
import { CreateExamReq, ExamResponse } from '.'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	AddDailyCheckupReq,
	addImagesRes,
	AllExamReq,
	AllExamRes,
	createPrescriptionDays,
	createPrescriptionReq,
	CreateService,
	createServiceDays,
	deletePrescriptionReq,
	ExamRes,
	GetAlldailyCheckup,
	imageReq,
	MutationRes,
	RemoveService,
	reomveimagesRes,
	takeMedicine,
	takeService,
	UpdateExamReq,
	updatePrescriptionReq,
	UpdateService,
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
		createPrescriptionDays: builder.mutation<void, createPrescriptionDays>({
			query: ({ id, prescriptionId, data }) => ({
				url: `${PATHS.UPDATE_EXAM}${id}/prescription/${prescriptionId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		takeMedicine: builder.mutation<void, takeMedicine>({
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
				url: PATHS.CREATE_EXAM + id + PATHS.PRESCRIPTION,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		updatePrescription: builder.mutation<MutationRes, updatePrescriptionReq>({
			query: ({ id, prescription_id, body }) => ({
				url: PATHS.UPDATE_EXAM + id + PATHS.PRESCRIPTION + prescription_id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		deletePrescription: builder.mutation<MutationRes, deletePrescriptionReq>({
			query: ({ id, prescription_id }) => ({
				url: PATHS.DELETE_EXAM + id + PATHS.PRESCRIPTION + prescription_id,
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

		//service

		addServiceToExamination: builder.mutation<MutationRes, CreateService>({
			query: ({ id, body }) => ({
				url: PATHS.CREATE_EXAM + id + '/service',
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		updateServiceFromExamination: builder.mutation<MutationRes, UpdateService>({
			query: ({ id, service_id, body }) => ({
				url: PATHS.UPDATE_EXAM + id + '/service/' + service_id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		removeServiceFromExamination: builder.mutation<MutationRes, RemoveService>({
			query: ({ id, service_id }) => ({
				url: PATHS.DELETE_EXAM + id + '/service/' + service_id,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		createServiceDays: builder.mutation<void, createServiceDays>({
			query: ({ id, serviceId, data }) => ({
				url: `${PATHS.UPDATE_EXAM}${id}/service/${serviceId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		takeService: builder.mutation<void, takeService>({
			query: ({ id, serviceId, day }) => ({
				url: `${PATHS.TAKE_MEDICINE}${id}/service/${serviceId}/day/${day}`,
				method: 'PATCH',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),

		// daily-checkup

		AddDailyCheckup: builder.mutation<MutationRes, AddDailyCheckupReq>({
			query: ({ id, body }) => ({
				url: `${PATHS.EXAMINATION}add/${id}${PATHS.DAILY_CHECKUP}`,
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		UpdateDailyCheckup: builder.mutation<MutationRes, AddDailyCheckupReq>({
			query: ({ id, body, checkup_id }) => ({
				url: `${PATHS.EXAMINATION}update/${id}${PATHS.DAILY_CHECKUP}/${checkup_id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		DeleteDailyCheckup: builder.mutation<
			MutationRes,
			{ id: string; checkup_id: string }
		>({
			query: ({ id, checkup_id }) => ({
				url: `${PATHS.EXAMINATION}delete/${id}${PATHS.DAILY_CHECKUP}/${checkup_id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [API_TAGS.EXAMS],
		}),
		getDailyCheckup: builder.query<GetAlldailyCheckup, string>({
			query: id => ({
				url: `${PATHS.EXAMINATION}get-all/${id}/daily-checkups`,
			}),
			providesTags: [API_TAGS.EXAMS],
		}),
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
	useTakeMedicineMutation,
	useAddServiceToExaminationMutation,
	useRemoveServiceFromExaminationMutation,
	useUpdateServiceFromExaminationMutation,
	useCreateServiceDaysMutation,
	useTakeServiceMutation,
	useAddDailyCheckupMutation,
	useUpdateDailyCheckupMutation,
	useDeleteDailyCheckupMutation,
	useGetDailyCheckupQuery,
} = examinationApi
