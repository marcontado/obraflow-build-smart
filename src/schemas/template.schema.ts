import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  category: z.enum(['contrato', 'proposta', 'termo', 'relatorio', 'outro']),
  content: z.any(),
  variables_used: z.array(z.string()).optional(),
  signatures: z.any().optional(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

export const generateDocumentSchema = z.object({
  template_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do documento é obrigatório"),
});

export type GenerateDocumentFormData = z.infer<typeof generateDocumentSchema>;
