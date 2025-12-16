import { z } from "zod"

export const profileSchema = (editingUserId = false)=> z.object({
	fullname: z.string().min(1, "Тўлиқ исм киритилиши шарт"),
	username: z.string().min(1, "Фойдаланувчи номи киритилиши шарт"),
	phone: z
		.string()
		.regex(/^\+?\d{9,15}$/, "Телефон рақам нотўғри форматда"),
	license_number: z.string().min(1, "Лицензия рақамини киритиш керак")
})
