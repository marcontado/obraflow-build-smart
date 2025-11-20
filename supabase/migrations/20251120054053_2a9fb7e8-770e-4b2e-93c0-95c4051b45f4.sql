-- ============================================================================
-- MÓDULO: MODELOS E DOCUMENTOS
-- ============================================================================
-- Tabelas para gerenciar templates de documentos e documentos gerados

-- Tabela de templates de documentos
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('contrato', 'proposta', 'termo', 'relatorio', 'outro')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  variables_used TEXT[] DEFAULT '{}',
  signatures JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de documentos gerados
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  content_rendered JSONB NOT NULL,
  pdf_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_document_templates_workspace ON public.document_templates(workspace_id);
CREATE INDEX idx_document_templates_category ON public.document_templates(category);
CREATE INDEX idx_generated_documents_workspace ON public.generated_documents(workspace_id);
CREATE INDEX idx_generated_documents_project ON public.generated_documents(project_id);
CREATE INDEX idx_generated_documents_template ON public.generated_documents(template_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- RLS POLICIES - Document Templates
-- ============================================================================

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Members podem visualizar templates do workspace
CREATE POLICY "Members can view workspace templates"
  ON public.document_templates FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem criar templates no workspace
CREATE POLICY "Members can create workspace templates"
  ON public.document_templates FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id)
    AND created_by = auth.uid()
  );

-- Members podem atualizar templates do workspace
CREATE POLICY "Members can update workspace templates"
  ON public.document_templates FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem deletar templates do workspace
CREATE POLICY "Members can delete workspace templates"
  ON public.document_templates FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins podem visualizar todos os templates
CREATE POLICY "Platform admins can view all templates"
  ON public.document_templates FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - Generated Documents
-- ============================================================================

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Members podem visualizar documentos do workspace
CREATE POLICY "Members can view workspace documents"
  ON public.generated_documents FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem criar documentos no workspace
CREATE POLICY "Members can create workspace documents"
  ON public.generated_documents FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id)
    AND created_by = auth.uid()
  );

-- Members podem deletar documentos do workspace
CREATE POLICY "Members can delete workspace documents"
  ON public.generated_documents FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins podem visualizar todos os documentos
CREATE POLICY "Platform admins can view all documents"
  ON public.generated_documents FOR SELECT
  USING (is_platform_admin(auth.uid()));