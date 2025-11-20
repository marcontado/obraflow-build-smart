import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["ativo", "inativo"]).default("ativo"),
  
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip_code: z.string().optional(),
  
  rating: z.number().min(0).max(5).default(0),
  logo_url: z.string().url().optional().or(z.literal("")),
  diferencial: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;

export const PARTNER_CATEGORIES = [
  "Materiais de Construção",
  "Serviços Elétricos",
  "Pintura e Revestimentos",
  "Hidráulica",
  "Marcenaria",
  "Design e Decoração",
  "Paisagismo",
  "Outro",
] as const;
