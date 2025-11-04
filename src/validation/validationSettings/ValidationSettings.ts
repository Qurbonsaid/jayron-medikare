import { z } from "zod"

export const settingsSchema = z.object({
  clinic_name: z.string().min(1, "Клиника номи киритилмаган"),
  address: z.string().min(1, "Манзил киритилмаган"),
  phone: z
    .string()
    .regex(/^\+998\d{9}$/, "Телефон рақами +998XXXXXXXXX форматда бўлиши керак"),
  email: z
    .string()
    .email("Email нотўғри форматда"),
  work_start_time: z.string().min(1, "Иш бошланиш вақти киритилмаган"),
  work_end_time: z.string().min(1, "Иш тугаш вақти киритилмаган"),
  logo_path: z.string().min(1, "Логотип юкланмаган"),
})

export type SettingsFormType = z.infer<typeof settingsSchema>
