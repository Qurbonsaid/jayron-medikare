export type UserCreateResponse =  {
		"username": string,
		"password": string,
		"fullname": string,
		"email": string,
		"phone": string,
		"role": string,
		"section": string,
		"permissions": [
			string
		],
		"license_number": string
}