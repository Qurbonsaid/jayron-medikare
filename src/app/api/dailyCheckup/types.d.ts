import { Entry } from './types.d';
export interface Response {
	success: boolean
	message?: string
	error?: {
		statusCode: string
		statusMsg: string
		msg: string
	}
}

export interface Entry {
	date: string
	blood_pressure: {
		systolic: number
		diastolic: number
	}
	notes: string
	_id?: string
}

export interface DailyCheckupCreate {
	examination_id: string
	entries: Entry[]
}

export interface Examination {
	_id: string
	patient_id: string
	doctor_id: string
	diagnosis: null
	description: string
	complaints: string
	treatment_type: string
	status: string
	created_at: string
	updated_at: string
}
export interface Patient {
	_id: string
	patient_id: string
	fullname: string
	phone: string
	gender: string
	date_of_birth: string
	address: string
}
export interface Doctor {
	_id: string
	fullname: string
	username: string
	phone: string
	role: string
	section: string
	license_number: string
}
export interface Pagination {
	total: number
	page: number
	limit: number
	totalPages: number
}
export interface DailyCheckupGetAll {
	success: true
	data: 
		{
			_id: string
			examination_id: Examination
			patient_id: Patient
			doctor_id: Doctor
			entries: Entry[]
			created_at: string
			updated_at: string
		}[]
	pagination: Pagination
}

export interface GetOneDailyCheckup {
	success: true
	data: {
		_id: '6936657d029e0b7cb4040a25'
		examination_id: Examination
		patient_id: Patient
		doctor_id: Doctor
		entries: Entry[]
		created_at: '2025-12-08T05:43:25.630Z'
		updated_at: '2025-12-08T05:43:25.630Z'
	}
}
