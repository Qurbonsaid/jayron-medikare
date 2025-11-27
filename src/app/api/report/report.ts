import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { REPORT_DATE_FILTER } from './types'
import {
	AnalysisReportResponse,
	BillingResponse,
	DiagnosisReportResponse,
	DoctorReportResponse,
	ExaminationReportResponse,
	PatientReportResponse,
	RoomReportResponse,
	UserReportResponse,
} from './types.d'

export const ReportApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getAllBillings: builder.query<
			BillingResponse,
			{ interval: REPORT_DATE_FILTER; page?: number; limit?: number }
		>({
			query: ({ interval, page = 1, limit = 10 }) => ({
				url: `${PATHS.BILLING}`,
				method: 'GET',
				params: {
					interval,
					page,
					limit,
				},
			}),
		}),
		getAllUsers: builder.query<UserReportResponse, void>({
			query: () => ({
				url: `${PATHS.USER}`,
				method: 'GET',
			}),
		}),
		getAllPatients: builder.query<
			PatientReportResponse,
			{ interval: REPORT_DATE_FILTER; page?: number; limit?: number }
		>({
			query: ({ interval, page = 1, limit = 10 }) => ({
				url: `${PATHS.PATIENT}`,
				method: 'GET',
				params: {
					interval,
					page,
					limit,
				},
			}),
		}),
		getAllExaminations: builder.query<
			ExaminationReportResponse,
			{ interval: REPORT_DATE_FILTER; page?: number; limit?: number }
		>({
			query: ({ interval, page = 1, limit = 10 }) => ({
				url: `${PATHS.EXAMINATION}`,
				method: 'GET',
				params: {
					interval,
					page,
					limit,
				},
			}),
		}),
		getAllAnalysis: builder.query<
			AnalysisReportResponse,
			{ interval: REPORT_DATE_FILTER; page?: number; limit?: number }
		>({
			query: ({ interval, page = 1, limit = 10 }) => ({
				url: `${PATHS.ANALYSIS}`,
				method: 'GET',
				params: {
					interval,
					page,
					limit,
				},
			}),
		}),
		getDiagnosis: builder.query<DiagnosisReportResponse, void>({
			query: () => ({
				url: `${PATHS.DIAGNOSIS}`,
				method: 'GET',
			}),
		}),
		getAllDoctors: builder.query<
			DoctorReportResponse,
			{ interval: REPORT_DATE_FILTER; page?: number; limit?: number }
		>({
			query: ({ interval, page = 1, limit = 10 }) => ({
				url: `${PATHS.DOCTOR}`,
				method: 'GET',
				params: {
					interval,
					page,
					limit,
				},
			}),
		}),
		getAllRooms: builder.query<RoomReportResponse, void>({
			query: () => ({
				url: `${PATHS.ROOM}`,
				method: 'GET',
			}),
		}),
	}),
})

export const {
	useGetAllBillingsQuery,
	useGetAllUsersQuery,
	useGetAllPatientsQuery,
	useGetAllExaminationsQuery,
	useGetAllAnalysisQuery,
	useGetDiagnosisQuery,
	useGetAllDoctorsQuery,
	useGetAllRoomsQuery,
} = ReportApi
