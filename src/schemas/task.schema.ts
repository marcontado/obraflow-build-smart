import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
  area_id: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
  project_start_date: z.string().optional(),
  project_end_date: z.string().optional(),
}).refine((data) => {
  if (data.due_date && data.project_start_date && data.project_end_date) {
    const dueDate = new Date(data.due_date);
    const startDate = new Date(data.project_start_date);
    const endDate = new Date(data.project_end_date);
    return dueDate >= startDate && dueDate <= endDate;
  }
  return true;
}, {
  message: "Data de vencimento deve estar dentro do período do projeto",
  path: ["due_date"],
});

export type TaskFormData = z.infer<typeof taskSchema>;
