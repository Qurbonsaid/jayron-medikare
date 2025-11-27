export enum MedicationForm {
	SOLID = 'solid',
	LIQUID = 'liquid',
	INJECTION = 'injection',
	TOPICAL = 'topical',
}

export interface response {
	success: boolean
	message: string
}

export interface PaginationMedication {
	page: number
	limit: number
	total_items: number
	total_pages: number
	next_page: null | number
	prev_page: null | number
}

export interface MedicationCreated {
	name: string
	form: MedicationForm
	dosage: string
	is_active: boolean
}

export interface MedicationGetAllReq {
	page?: number
	limit?: number
	search?: string
	form?: MedicationForm
	is_active?: boolean
}

export interface MedicationGetAllRes {
	success: boolean
	data: {
		_id: string
		name: string
		form: MedicationForm
		dosage: string
		is_active: boolean
		created_at: string
		updated_at: string
	}[]
	pagination: PaginationMedication
}

export interface MedicationGetByIdRes {
	success: boolean
	data: {
		_id: string
		name: string
		form: MedicationForm
		dosage: string
		is_active: boolean
		created_at: string
		updated_at: string
	}
}



