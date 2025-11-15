import { NormalRange } from '../diagnostic/types'

export enum ExamLevel {
	ODDIY = 'ODDIY',
	SHOSHILINCH = 'SHOSHILINCH',
	JUDA_SHOSHILINCH = 'JUDA_SHOSHILINCH',
}

export enum ExamStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export type CreateReq = {
	analysis: string[]
	patient: string
	level: ExamLevel
	clinical_indications: string
	comment: string
}

export type CreateRes = {
	success: boolean
	message: string
	data: {
		analysis_type: string
		patient: string
		results: []
		level: ExamLevel
		clinical_indications: string
		comment: string
		status: ExamStatus
		_id: string
		created_at: string
		updated_at: string
	}[]
}

export type GetAllPatientAnalysisRes = {
	success: boolean
	data: {
		_id: string
		analysis_type: {
			_id: string
			code: string
			name: string
		}
		patient: {
			_id: string
			patient_id: string
			fullname: string
			phone: string
		}
		results: {
			analysis_parameter_type: {
				_id: string
				parameter_name: string
				unit: string
			}
			analysis_parameter_value: string
			_id: string
		}[]
		level: ExamLevel
		clinical_indications: string
		comment: string
		status: ExamStatus
		created_at: string
		updated_at: string
	}[]
	pagination: {
		page: number
		limit: number
		total_items: number
		total_pages: number
		next_page: number | null
		prev_page: number | null
	}
}

export type Filters = {
	page: number
	limit: number
	patient?: string
	status?: string
	level?: string
	analysis_type?: string
}

export type GetByIdRes = {
	success: boolean
	data: {
		_id: string
		analysis_type: {
			_id: string
			code: string
			name: string
			description: string
		}
		patient: {
			_id: string
			patient_id: string
			fullname: string
			phone: string
			gender: 'male' | 'female' | 'general'
			date_of_birth: string
		}
		results: {
			analysis_parameter_type: {
				normal_range: NormalRange
				_id: string
				parameter_code: string
				parameter_name: string
				unit: string
				value_type: 'NUMBER' | 'STRING'
				gender_type: 'GENERAL' | 'MALE_FEMALE'
			}
			analysis_parameter_value: number | string
			_id: string
		}[]
		level: ExamLevel
		clinical_indications: string
		comment: string
		status: ExamStatus
		created_at: string
		updated_at: string
	}
}

export type UpdateReq = {
	results: [
		{
			analysis_parameter_type: string
			analysis_parameter_value: string | number
		}
	]
	status: ExamStatus
	level: ExamLevel
	clinical_indications: string
	comment: string
}

export type UpdateRes = {
	success: boolean
	message: string
	data: {
		_id: string
		analysis_type: string
		patient: string
		results: [
			{
				analysis_parameter_type: string
				analysis_parameter_value: number |string
				_id: string
			}
		]
		level: ExamLevel
		clinical_indications: string
		comment: string
		status: ExamStatus
		created_at: string
		updated_at: string
	}
}
