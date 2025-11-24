import { z } from "zod";

export const budgetCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um código hexadecimal válido"),
  icon: z.string().min(1, "Selecione um ícone"),
  sort_order: z.number().int().min(0).optional(),
});

export type BudgetCategoryFormData = z.infer<typeof budgetCategorySchema>;
