import { z } from "zod";

// Helper para validar CPF (validação básica)
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Valida se todos os dígitos são iguais
  return true;
};

// Helper para validar CNPJ (validação básica)
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Valida se todos os dígitos são iguais
  return true;
};

export const clientSchema = z.object({
  client_type: z.enum(["PF", "PJ"]).default("PF"),
  
  // Campos comuns
  name: z.string().min(3, "Nome/Razão Social deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().max(2, "Use sigla do estado (ex: SP)").optional().or(z.literal("")),
  zip_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  
  // Campos PF (Pessoa Física)
  cpf: z.string().optional().or(z.literal("")),
  rg: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  marital_status: z.string().optional().or(z.literal("")),
  
  // Campos PJ (Pessoa Jurídica)
  cnpj: z.string().optional().or(z.literal("")),
  razao_social: z.string().optional().or(z.literal("")),
  inscricao_estadual: z.string().optional().or(z.literal("")),
  inscricao_municipal: z.string().optional().or(z.literal("")),
  
  // Representantes (IDs dos clientes PF que representam esta PJ)
  representative_ids: z.array(z.string()).optional(),
}).refine((data) => {
  // Se for PF e tiver CPF preenchido, validar
  if (data.client_type === "PF" && data.cpf && data.cpf.trim()) {
    return validateCPF(data.cpf);
  }
  return true;
}, {
  message: "CPF inválido",
  path: ["cpf"],
}).refine((data) => {
  // Se for PJ e tiver CNPJ preenchido, validar
  if (data.client_type === "PJ" && data.cnpj && data.cnpj.trim()) {
    return validateCNPJ(data.cnpj);
  }
  return true;
}, {
  message: "CNPJ inválido",
  path: ["cnpj"],
});

export type ClientFormData = z.infer<typeof clientSchema>;
