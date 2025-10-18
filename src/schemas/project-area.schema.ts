import { z } from "zod";

export const projectAreaSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
});

export type ProjectAreaFormData = z.infer<typeof projectAreaSchema>;
