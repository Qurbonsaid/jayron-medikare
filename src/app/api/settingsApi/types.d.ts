export type GetAll = {
	success: boolean,
	data: Settings
}

export type Settings = {
	clinic_name: string,
	address: string,
	phone: string,
	email: string,
	work_start_time: string,
	work_end_time: string,
	logo_path: string
}