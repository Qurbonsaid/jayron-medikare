export interface Response {
	success: boolean
	message?: string
	error?: {
		statusCode: string
		statusMsg: string
		msg: string
	}
}

export interface DailyCheckupFilter {
	page: number
	limit: number
	patient_id?: string
	doctor_id?: string
	room_id?: string
	search?: string
	current_date?: string
	examination_status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
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
	totalPages?: number
	total_pages?: number
	total_items?: number
}
export interface Room {
	_id: string
	room_name: string
	corpus_id: string
	floor_number: number
}

export interface DailyCheckupGetAll {
	success: true
	data: {
		_id: string
		patient_id: Patient | string
		nurse_id?: Doctor
		room_id?: string | Room
		result?: {
			systolic: number
			diastolic: number
		}
		notes?: string
		created_at: string
		updated_at: string
	}[]
	pagination: Pagination
}

export interface GetOneDailyCheckup {
	success: true
	data: {
		_id: string
		patient_id: Patient | string
		nurse_id?: Doctor
		room_id?: string | Room
		result?: {
			systolic: number
			diastolic: number
		}
		notes?: string
		created_at: string
		updated_at: string
	}
}

export interface UncheckedPatient {
	patient: {
		_id: string
		fullname: string
		phone: string
		gender: string
		date_of_birth: string
		address: string
	}
	room: {
		_id: string
		room_name: string
		floor_number: number
		corpus_id: {
			_id: string
			corpus_number: number
		}
	}
	bed_number: number
	start_date: string
	estimated_leave_time: string
}

export interface UncheckedPatientsResponse {
	success: boolean
	message: string
	total: number
	data: UncheckedPatient[]
}
