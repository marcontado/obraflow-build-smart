import { z } from "zod";

export const deliverySchema = z.object({
  project_id: z.string().uuid("ID do projeto inválido"),
  budget_item_id: z.string().uuid().optional().nullable(),
  area_id: z.string().uuid().optional().nullable(),
  
  delivery_date: z.string().min(1, "Data da entrega é obrigatória"),
  supplier_name: z.string().min(1, "Nome do fornecedor é obrigatório").max(255),
  
  photos: z.any().optional(),
  attachments: z.any().optional(),
  
  status: z.enum(["recebido", "conferido", "armazenado", "aplicado"]).default("recebido"),
  notes: z.string().optional().nullable(),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;
