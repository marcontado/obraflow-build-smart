-- Criar tabela de parceiros com isolamento multi-tenant
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  
  -- Contato
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Avaliação e metadados
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  logo_url TEXT,
  diferencial TEXT,
  notes TEXT,
  
  -- Timestamps e auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE public.partners IS 'Tabela de parceiros e fornecedores vinculados a workspaces';
COMMENT ON COLUMN public.partners.workspace_id IS 'ID do workspace ao qual o parceiro pertence (isolamento multi-tenant)';

-- Índices para performance
CREATE INDEX idx_partners_workspace ON public.partners(workspace_id);
CREATE INDEX idx_partners_category ON public.partners(category);
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partners_rating ON public.partners(rating DESC);

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_partners
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Members podem ver parceiros do workspace
CREATE POLICY "Members can view workspace partners"
  ON public.partners FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem criar parceiros
CREATE POLICY "Members can create workspace partners"
  ON public.partners FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id) 
    AND created_by = auth.uid()
  );

-- Members podem atualizar parceiros
CREATE POLICY "Members can update workspace partners"
  ON public.partners FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem deletar parceiros
CREATE POLICY "Members can delete workspace partners"
  ON public.partners FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins podem ver todos
CREATE POLICY "Platform admins can view all partners"
  ON public.partners FOR SELECT
  USING (is_platform_admin(auth.uid()));