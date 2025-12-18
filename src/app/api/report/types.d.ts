import { Pagination } from './../patientApi/types.d'
export enum REPORT_DATE_FILTER {
	DAILY = 'daily',
	THIS_WEEK = 'weekly',
	THIS_MONTH = 'monthly',
	QUARTERLY = 'quarterly',
	THIS_YEAR = 'yearly',
}

export interface Pagination {
	total_items: number
	total_pages: number
	current_page: number
	limit: number
	next_page: number | null
	prev_page: number | null
}

export interface BillingResponse {
	success: boolean
	data: {
		_id: {
			year: number
			month?: number
			day?: number
		}
		totalAmount: number
		paidAmount: number
		debtAmount: number
	}[]
	pagination: Pagination
}

export interface UserReportResponse {
	success: boolean
	data: {
		doctor: {
			total: number
			active: number
			inactive: number
		}
		nurse: {
			total: number
			active: number
			inactive: number
		}
		receptionist: {
			total: number
			active: number
			inactive: number
		}
	}
}

export interface PatientReportResponse {
	success: boolean
	data: {
		_id: {
			year: number
			month?: number
			day?: number
		}
		totalPatients: number
		activePatients: number
		inactivePatients: number
	}[]
	pagination: Pagination
}

export interface ExaminationReportResponse {
	success: boolean
	data: {
		_id: {
			year: number
			month?: number
			day?: number
		}
		totalExaminations: number
		totalAmount: number
	}[]
	pagination: Pagination
}

export interface AnalysisReportResponse {
	success: boolean
	data: {
		_id: {
			year: number
			month?: number
			day?: number
		}
		totalAnalyses: number
	}[]
	pagination: Pagination
}

export interface DiagnosisReportResponse {
	success: boolean
	message: string
	data: {
		totalExaminations: number
		diagnosisStats: {
			diagnosis_id: string
			diagnosis_name: string
			diagnosis_code: string
			diagnosis_description: string
			count: number
			percentage: number
		}[]
	}
}

export interface DoctorReportResponse {
	success: boolean
	data: {
		_id: {
			doctor_id: string
			year: number
			month: number
			week: number
			day: number
		}
		totalExaminations: number
		doctor_id: string
		doctor_name: string
		doctor_phone: string
		doctor_email: string
	}
	[]
	pagination: Pagination
}

export interface RoomReportResponse {
	success: boolean
	message: string
	data: {
		totalRooms: number
		totalBeds: number
		occupiedBeds: number
		availableBeds: number
		occupancyRate: number
	}
}

export interface BloodPressureReportResponse {
	success: boolean
	data: {
		_id: {
			year: number
			month?: number
			day?: number
		}
		date: string
		blood_pressure: {
			systolic: number
			diastolic: number
		}
		notes: string
		patient_id: string
		examination_id: string
	}[]
	pagination: Pagination
}
