import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
  area_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
