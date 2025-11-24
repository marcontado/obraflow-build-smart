import { z } from "zod";

export const deliverySchema = z.object({
  project_id: z.string().uuid("ID do projeto inválido"),
  budget_item_id: z.string().uuid().optional().nullable(),
  area_id: z.string().uuid().optional().nullable(),
  
  delivery_date: z.string().min(1, "Data da entrega é obrigatória"),
  
  // Fornecedor pode ser um parceiro existente ou um novo nome
  partner_id: z.string().uuid().optional().nullable(),
  supplier_name: z.string().min(1, "Nome do fornecedor é obrigatório").max(255),
  
  // Registro de quem recebeu
  received_by: z.string().optional().nullable(),
  received_signature: z.string().optional().nullable(),
  
  photos: z.any().optional(),
  attachments: z.any().optional(),
  
  status: z.enum(["recebido", "conferido", "armazenado", "aplicado"]).default("recebido"),
  notes: z.string().optional().nullable(),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;

// Schema para criação de novo fornecedor durante o registro de entrega
export const newPartnerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  category: z.string().default("fornecedor"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
});
