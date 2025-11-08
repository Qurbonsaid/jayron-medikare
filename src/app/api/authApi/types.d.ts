import { RoleConstants } from '@/constants/Roles'
export type LoginRequest = {
	username: string
	password: string
}
export type LoginResponse = {
	success: boolean
	access_token: string
	error: {
		statusCode: number
		statusMsg: string
		msg: string
	}
}
export type MeResponse = {
	success: boolean
	data: {
		_id: string
		fullname: string
		username: string
		email: string
		phone: string
		role: RoleConstants
		section: SectionConstants
		license_number: string
		permissions: PermissionConstants
		status: 'active' | 'inactive'
		created_at: Date
		updated_at: Date
	}
}

export type UpdateMeRequest = {
	fullname: string
	username: string
	email: string
	phone: string
	license_number: string
}
