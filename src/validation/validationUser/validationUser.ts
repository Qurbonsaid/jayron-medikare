import { z } from 'zod'

export const userSchema = (editingUserId = false) =>
	z.object({
		fullname: z.string().min(1, 'Тўлиқ исм киритилиши шарт'),
		username: z.string().min(1, 'Фойдаланувчи номи киритилиши шарт'),
		phone: z
			.string()
			.regex(/^\+998\d{9}$/, 'Телефон рақам нотўғри форматда'),
		password: editingUserId
			? z.string().optional()
			: z.string().min(6, 'Парол камида 6 та белгидан иборат бўлиши керак'),
		role: z.string().min(1, 'Рол танланиши керак').optional(),
		section: z.string().min(1, 'Бўлим танланиши керак').optional(),
		license_number: z
			.string()
			.min(1, 'Лицензия рақамини киритиш керак')
			.optional(),
	})
