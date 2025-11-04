import { z } from "zod"

export const userSchema = z.object({
	fullname: z.string().min(1, "Тўлиқ исм киритилиши шарт"),
	username: z.string().min(1, "Фойдаланувчи номи киритилиши шарт"),
	email: z.string().email("Email формат нотўғри"),
	phone: z
		.string()
		.regex(/^\+?\d{9,15}$/, "Телефон рақам нотўғри форматда"),
	password: z.string().min(6, "Парол камида 6 та белгидан иборат бўлиши керак"),
	role: z.string().min(1, "Рол танланиши керак"),
	section: z.string().min(1, "Бўлим танланиши керак"),
	license_number: z.string().min(1, "Лицензия рақамини киритиш керак"),
})
