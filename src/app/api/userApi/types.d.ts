
export type UserCreateResponse = {
	username: string
	password: string
	fullname: string
	email: string
	phone: string
	role: string
	section: string
	permissions: string[]
	license_number: string
}

export type User = {
	_id: string
	fullname: string
	username: string
	email: string
	phone: string
	role: string
	section: string
	status: string
	created_at: string
}

export type UserId = {
	_id: string,
	username: string,
	fullname: string,
	email: string,
	phone: string,
	role: string,
	section: string,
	permissions: string[],
	status: string,
	created_at: string,
	license_number: string
}

export type UsersGetAll = {
	success: boolean
	data: User[]
	pagination: {
		page: number
		limit: number
		total_items: number
		total_pages: number
		next_page: number | null
		prev_page: number | null
	}
}

export type UserGetByIdResponse = {
		success: boolean,
		data: UserId
}