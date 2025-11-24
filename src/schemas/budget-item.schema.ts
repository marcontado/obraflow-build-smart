import { z } from "zod";

export const budgetItemSchema = z.object({
  category_id: z.string().uuid("Selecione uma categoria"),
  area_id: z.string().uuid("Selecione um ambiente").optional().or(z.literal("")),
  item_name: z.string().min(2, "Nome do item deve ter no mínimo 2 caracteres"),
  executor: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["pendente", "cotado", "comprado", "aplicado"]).default("pendente"),
  
  // Medições
  measurement_unit: z.string().default("m²"),
  measurement_base: z.string().optional().or(z.literal("")),
  add_margin: z.boolean().default(false),
  measurement_purchased: z.string().optional().or(z.literal("")),
  quantity: z.string().optional().or(z.literal("")),
  
  // Loja Principal
  store_name: z.string().optional().or(z.literal("")),
  product_code: z.string().optional().or(z.literal("")),
  unit_price: z.string().optional().or(z.literal("")),
  store_link: z.string().url("Link inválido").optional().or(z.literal("")),
  
  // Loja Alternativa
  alternative_store_name: z.string().optional().or(z.literal("")),
  alternative_product_code: z.string().optional().or(z.literal("")),
  alternative_unit_price: z.string().optional().or(z.literal("")),
  alternative_store_link: z.string().url("Link inválido").optional().or(z.literal("")),
  
  // Controle
  selected_store: z.enum(["main", "alternative"]).default("main"),
  deadline: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;
