import { z } from "zod";

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z.string().optional().nullable(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
