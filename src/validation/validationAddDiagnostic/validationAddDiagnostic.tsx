import { z } from 'zod'

export const addDiagnosticSchema = () =>
	z.object({
		code: z.string().min(1, 'Cод киритилиши шарт'),
		name: z.string().min(1, 'Тўлиқ номи киритилиши шарт'),
		description: z.string().optional(),
	})

export const addParameterSchema = () =>
	z.object({
		analysis_id: z.string().min(1, 'Cод киритилиши шарт'),
		parameter_code: z.string().min(1, 'Cод киритилиши шарт'),
		parameter_name: z.string().min(1, 'Тўлиқ номи киритилиши шарт'),
		unit: z.string().min(1, 'Cод киритилиши шарт'),
		normal_range: z.string().optional(),
		description: z.string().optional(),
	})

