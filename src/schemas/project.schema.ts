import { z } from "zod";

// Schema para briefing
export const briefingSchema = z.object({
  goal: z.string().optional(),
  style: z.string().optional(),
  audience: z.string().optional(),
  needs: z.string().optional(),
  restrictions: z.string().optional(),
  preferred_materials: z.string().optional(),
  references_links: z.string().optional(),
});

// Schema completo do projeto (wizard multi-step)
export const projectWizardSchema = z.object({
  // Step 1: Informações Básicas
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional().or(z.literal("")),
  client_id: z.string().uuid("Selecione um cliente").optional().or(z.literal("")),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  progress: z.number().min(0).max(100).optional(),
  type: z.enum(['residential', 'commercial', 'corporate', 'interior', 'renovation', 'other']).optional(),
  location: z.string().optional().or(z.literal("")),
  
  // Step 2: Briefing
  briefing: briefingSchema.optional(),
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

export type ProjectWizardData = z.infer<typeof projectWizardSchema>;
export type BriefingData = z.infer<typeof briefingSchema>;

// Manter compatibilidade com código existente
export const projectSchema = projectWizardSchema;
export type ProjectFormData = ProjectWizardData;
