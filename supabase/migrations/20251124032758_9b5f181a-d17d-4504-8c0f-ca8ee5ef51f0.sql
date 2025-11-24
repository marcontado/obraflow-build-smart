-- ============================================
-- CLIENTES PF/PJ - PESSOA FÍSICA E JURÍDICA (VERSÃO FLEXÍVEL)
-- ============================================

-- Criar ENUM para tipo de cliente
CREATE TYPE public.client_type AS ENUM ('PF', 'PJ');

-- Adicionar colunas na tabela clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS client_type public.client_type NOT NULL DEFAULT 'PF',
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS razao_social TEXT,
  ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
  ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;

-- Criar índice para busca por CNPJ
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON public.clients(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON public.clients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_type ON public.clients(client_type);

-- Tabela de representantes legais (vincula PJ a PF)
CREATE TABLE IF NOT EXISTS public.client_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  
  -- Cliente PJ (empresa)
  company_client_id UUID NOT NULL,
  
  -- Cliente PF (representante legal)
  representative_client_id UUID NOT NULL,
  
  -- Tipo de representação
  role TEXT DEFAULT 'representante_legal',
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign keys
  CONSTRAINT fk_representative_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_representative_company FOREIGN KEY (company_client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_representative_person FOREIGN KEY (representative_client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT unique_company_representative UNIQUE (company_client_id, representative_client_id),
  CONSTRAINT different_clients CHECK (company_client_id != representative_client_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_representatives_workspace ON public.client_representatives(workspace_id);
CREATE INDEX IF NOT EXISTS idx_representatives_company ON public.client_representatives(company_client_id);
CREATE INDEX IF NOT EXISTS idx_representatives_person ON public.client_representatives(representative_client_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_representatives_updated_at ON public.client_representatives;
CREATE TRIGGER update_representatives_updated_at
  BEFORE UPDATE ON public.client_representatives
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ADICIONAR CAMPOS AO PROJETO
-- ============================================

-- Adicionar responsável principal e contato principal
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_manager_id UUID,
  ADD COLUMN IF NOT EXISTS main_contact_id UUID;

-- Adicionar foreign keys se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_manager'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_project_manager 
      FOREIGN KEY (project_manager_id) 
      REFERENCES public.clients(id) 
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_main_contact'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_main_contact 
      FOREIGN KEY (main_contact_id) 
      REFERENCES public.clients(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_contact ON public.projects(main_contact_id);

-- ============================================
-- RLS POLICIES - CLIENT REPRESENTATIVES
-- ============================================

ALTER TABLE public.client_representatives ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Members can view workspace representatives" ON public.client_representatives;
DROP POLICY IF EXISTS "Members can create workspace representatives" ON public.client_representatives;
DROP POLICY IF EXISTS "Members can update workspace representatives" ON public.client_representatives;
DROP POLICY IF EXISTS "Members can delete workspace representatives" ON public.client_representatives;
DROP POLICY IF EXISTS "Platform admins can view all representatives" ON public.client_representatives;

-- Members podem ver representantes do workspace
CREATE POLICY "Members can view workspace representatives"
  ON public.client_representatives
  FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem criar representantes
CREATE POLICY "Members can create workspace representatives"
  ON public.client_representatives
  FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

-- Members podem atualizar representantes
CREATE POLICY "Members can update workspace representatives"
  ON public.client_representatives
  FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem deletar representantes
CREATE POLICY "Members can delete workspace representatives"
  ON public.client_representatives
  FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins podem ver todos os representantes
CREATE POLICY "Platform admins can view all representatives"
  ON public.client_representatives
  FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- ============================================
-- FUNÇÃO HELPER PARA VALIDAR PJ
-- ============================================

-- Função para verificar se PJ tem representante
CREATE OR REPLACE FUNCTION public.pj_has_representative(_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.client_representatives
    WHERE company_client_id = _client_id
  )
$$;

-- Função para obter representantes de uma PJ
CREATE OR REPLACE FUNCTION public.get_client_representatives(_client_id uuid, _workspace_id uuid)
RETURNS TABLE (
  id uuid,
  representative_client_id uuid,
  representative_name text,
  representative_cpf text,
  representative_email text,
  representative_phone text,
  role text,
  is_primary boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cr.id,
    cr.representative_client_id,
    c.name as representative_name,
    c.cpf as representative_cpf,
    c.email as representative_email,
    c.phone as representative_phone,
    cr.role,
    cr.is_primary
  FROM public.client_representatives cr
  INNER JOIN public.clients c ON c.id = cr.representative_client_id
  WHERE cr.company_client_id = _client_id
    AND cr.workspace_id = _workspace_id
  ORDER BY cr.is_primary DESC, c.name ASC
$$;

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN public.clients.client_type IS 'Tipo de cliente: PF (Pessoa Física) ou PJ (Pessoa Jurídica)';
COMMENT ON COLUMN public.clients.cnpj IS 'CNPJ para clientes PJ (opcional para permitir cadastros gradativos)';
COMMENT ON COLUMN public.clients.razao_social IS 'Razão social da empresa (PJ)';
COMMENT ON COLUMN public.clients.cpf IS 'CPF para clientes PF (opcional para permitir cadastros gradativos)';

COMMENT ON TABLE public.client_representatives IS 'Vincula representantes legais (PF) a empresas (PJ)';
COMMENT ON COLUMN public.client_representatives.company_client_id IS 'ID do cliente PJ (empresa)';
COMMENT ON COLUMN public.client_representatives.representative_client_id IS 'ID do cliente PF (representante legal)';
COMMENT ON COLUMN public.client_representatives.is_primary IS 'Indica se é o representante principal da empresa';

COMMENT ON COLUMN public.projects.project_manager_id IS 'Responsável principal pelo projeto (pode ser PF, PJ ou colaborador)';
COMMENT ON COLUMN public.projects.main_contact_id IS 'Contato principal em caso de necessidade (normalmente uma PF)';