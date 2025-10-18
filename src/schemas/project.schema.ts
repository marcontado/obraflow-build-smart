import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional().or(z.literal("")),
  client_id: z.string().uuid("Selecione um cliente").optional().or(z.literal("")),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  progress: z.number().min(0).max(100).optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: "Data final deve ser maior ou igual à data inicial",
  path: ["end_date"],
});

export type ProjectFormData = z.infer<typeof projectSchema>;
