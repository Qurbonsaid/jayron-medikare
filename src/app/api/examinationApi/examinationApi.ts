import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import {
	AddDailyCheckupReq,
	addImagesRes,
	AllExamReq,
	AllExamRes,
	CreateExamWithPrescriptionAndServiceReq,
	createPrescriptionDays,
	createPrescriptionReq,
	CreateService,
	createServiceDays,
	examCreateReq,
	ExamRes,
	ExamResponse,
	GetAlldailyCheckup,
	getAllPrescriptionReq,
	getAllPrescriptionRes,
	getAllServiceRes,
	getOnePrescriptionRes,
	getOneServiceRes,
	imageReq,
	MutationRes,
	reomveimagesRes,
	takeMedicine,
	takeService,
	UpdateExamReq,
	updatePrescriptionReq,
} from './types'

export const examinationApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// exams
		createExam: builder.mutation<ExamResponse, examCreateReq>({
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
		createExamWithPrescriptionAndService: builder.mutation<
			void,
			CreateExamWithPrescriptionAndServiceReq
		>({
			query: body => ({
				url: `examination/create-with-service-and-prescription`,
				method: 'POST',
				body,
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

		getManyPrescription: builder.query<
			getAllPrescriptionRes,
			getAllPrescriptionReq
		>({
			query: params => ({
				url: 'prescription/get-all',
				params,
			}),
			providesTags: [API_TAGS.PRESCRIPTION],
		}),
		getOnePrescription: builder.query<getOnePrescriptionRes, string>({
			query: id => ({
				url: 'prescription/get-one/' + id,
			}),
			providesTags: [API_TAGS.PRESCRIPTION],
		}),
		createPrescription: builder.mutation<MutationRes, createPrescriptionReq>({
			query: body => ({
				url: 'prescription/create',
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		updatePrescription: builder.mutation<MutationRes, updatePrescriptionReq>({
			query: ({ id, body }) => ({
				url: 'prescription/update/' + id,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: [API_TAGS.PRESCRIPTION],
		}),
		// deletePrescription: builder.mutation<MutationRes, deletePrescriptionReq>({
		// 	query: ({ id, prescription_id }) => ({
		// 		url: PATHS.DELETE_EXAM + id + PATHS.PRESCRIPTION + prescription_id,
		// 		method: 'DELETE',
		// 	}),
		// 	invalidatesTags: [API_TAGS.PRESCRIPTION],
		// }),

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
		getManyService: builder.query<getAllServiceRes, getAllPrescriptionReq>({
			query: params => ({
				url: 'service/get-all',
				params,
			}),
			providesTags: [API_TAGS.SERVICE],
		}),
		getOneService: builder.query<getOneServiceRes, string>({
			query: id => ({
				url: 'service/get-one/' + id,
			}),
			providesTags: [API_TAGS.SERVICE],
		}),
		addService: builder.mutation<MutationRes, CreateService>({
			query: body => ({
				url: 'service/create',
				method: 'POST',
				body,
			}),
			invalidatesTags: [API_TAGS.SERVICE],
		}),
		updateService: builder.mutation<MutationRes, CreateService>({
			query: body => ({
				url: '/service/update/' + body.examination_id,
				method: 'PATCH',
				body,
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
			query: ({ id, item_id, day }) => ({
				url: `service/take-item/${id}`,
				method: 'PATCH',
				body: {
					item_id,
					day,
				},
			}),
			invalidatesTags: [API_TAGS.EXAMS, API_TAGS.SERVICE],
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
	useGetAllExamsQuery,
	useGetOneExamQuery,
	useRemoveImagesMutation,
	useUpdateExamMutation,
	useUpdatePrescriptionMutation,
	useTakeMedicineMutation,
	useTakeServiceMutation,
	useAddDailyCheckupMutation,
	useUpdateDailyCheckupMutation,
	useDeleteDailyCheckupMutation,
	useGetDailyCheckupQuery,
	useAddServiceMutation,
	useGetManyPrescriptionQuery,
	useGetManyServiceQuery,
	useGetOnePrescriptionQuery,
	useGetOneServiceQuery,
	useUpdateServiceMutation,
	useCreateExamWithPrescriptionAndServiceMutation,
} = examinationApi
