export interface Pagination {
	page: number
	limit: number
	total: number
	totalPages: number
}

export interface PrescDay {
	day: number
	times: number
	date: null | string
	_id: string
}

export interface GetOnePresc {
	_id: string
	patient_id: {
		_id: string
		patient_id: string
		fullname: string
		phone: string
		gender: string
		date_of_birth: string
		address: string
	}
	doctor_id: {
		_id: string
		fullname: string
		username: string
		email: string
		phone: string
		role: 'doctor'
		section: 'Неврология'
		license_number: string
	}
	examination_id: {
		_id: string
		patient_id: string
		doctor_id: string
		diagnosis: null | string
		description: string
		complaints: string
		treatment_type: string
		status: string
		rooms: {
			room_id: string
			start_date: string
			room_price: number
			room_name: string
			floor_number: number
			_id: string
			end_date: string
		}[]
		created_at: string
		updated_at: string
	}
	items: {
		medication_id: {
			_id: string
			name: string
			form: string
			dosage: string
			is_active: boolean
		}
		addons: string
		frequency: number
		duration: number
		instructions: string
		days: PrescDay[]
		_id: string
	}[]

	created_at: string
	updated_at: string
}

export interface GetAllPresc {
	success: true
	data: GetOnePresc[]
	pagination: Pagination
}

export type Prescription = {
	medication_id: string
	addons: string
	frequency: number
	instructions: string
	duration: number
}

export interface createPrescriptionReq {
	examination_id: string
	items: Prescription[]
}

export interface updatePrescriptionReq {
	id: string
	body: {
		items: {
			_id: string
			medication_id: string
			addons: string
			frequency: number
			instructions: string
			duration: number
		}[]
	}
}

export interface takePresc {
	id: string
	body: {
		item_id: string
		day: number
	}
}

export interface MutationRes {
	success: boolean
	message?: string
	error?: {
		statusCode: number
		statusMsg: string
		msg: string
	}
}
