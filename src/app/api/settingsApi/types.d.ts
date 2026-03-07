export type GetAll = {
	success: boolean
	data: Settings
}

export type Settings = {
	_id: string
	clinic_name: string
	address: string
	phone: string
	email: string
	work_start_time: string
	work_end_time: string
	logo_path: string
	created_at: string
	updated_at: string
	contacts: {
		phone: string
		full_name: string
		_id?: string
	}[]
}
