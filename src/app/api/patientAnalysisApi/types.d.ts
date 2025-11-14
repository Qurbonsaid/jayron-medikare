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
