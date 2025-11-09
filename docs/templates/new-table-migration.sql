-- =====================================================
-- Template: Nova Tabela com Isolamento Multi-Tenant
-- =====================================================
-- 
-- Instruções:
-- 1. Substituir 'nova_entidade' pelo nome da sua tabela
-- 2. Adicionar seus campos específicos
-- 3. Ajustar políticas RLS conforme necessário
-- 4. Executar via supabase--migration tool
--

-- =====================================================
-- CRIAR TABELA
-- =====================================================

CREATE TABLE public.nova_entidade (
  -- IDs e relacionamentos
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- ⚠️ IMPORTANTE: workspace_id DEVE ser NOT NULL e ter CASCADE
  -- Isso garante que ao deletar workspace, todos os dados são removidos
  
  -- Seus campos de negócio aqui
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Metadados obrigatórios
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- INDEXES PARA PERFORMANCE
-- =====================================================

-- Index composto obrigatório para queries por workspace
CREATE INDEX idx_nova_entidade_workspace_id 
  ON public.nova_entidade(workspace_id);

-- Index adicional para ordenação por data
CREATE INDEX idx_nova_entidade_workspace_created 
  ON public.nova_entidade(workspace_id, created_at DESC);

-- Adicione outros indexes conforme suas queries mais comuns
-- Exemplo: se você busca muito por status dentro de workspace
-- CREATE INDEX idx_nova_entidade_workspace_status 
--   ON public.nova_entidade(workspace_id, status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS (obrigatório!)
ALTER TABLE public.nova_entidade ENABLE ROW LEVEL SECURITY;

-- Política: Membros podem visualizar registros do workspace
CREATE POLICY "Members can view workspace records"
ON public.nova_entidade FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

-- Política: Membros podem criar registros no workspace
CREATE POLICY "Members can create workspace records"
ON public.nova_entidade FOR INSERT
WITH CHECK (
  is_workspace_member(auth.uid(), workspace_id) 
  AND created_by = auth.uid()
);

-- Política: Membros podem atualizar registros do workspace
CREATE POLICY "Members can update workspace records"
ON public.nova_entidade FOR UPDATE
USING (is_workspace_member(auth.uid(), workspace_id));

-- Política: Membros podem deletar registros do workspace
CREATE POLICY "Members can delete workspace records"
ON public.nova_entidade FOR DELETE
USING (is_workspace_member(auth.uid(), workspace_id));

-- ⚠️ IMPORTANTE: Se sua tabela precisa de permissões mais específicas,
-- ajuste as políticas. Exemplos:
-- 
-- Apenas criador pode deletar:
-- USING (is_workspace_member(auth.uid(), workspace_id) AND created_by = auth.uid())
--
-- Apenas admins podem deletar:
-- USING (
--   has_workspace_role(auth.uid(), workspace_id, 'admin'::workspace_role) OR
--   has_workspace_role(auth.uid(), workspace_id, 'owner'::workspace_role)
-- )

-- =====================================================
-- TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_nova_entidade_updated_at
BEFORE UPDATE ON public.nova_entidade
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- POLÍTICA PARA ADMINS DA PLATAFORMA (opcional)
-- =====================================================

-- Se platform admins precisam ver todos os registros:
CREATE POLICY "Platform admins can view all records"
ON public.nova_entidade FOR SELECT
USING (is_platform_admin(auth.uid()));

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================

COMMENT ON TABLE public.nova_entidade IS 
  'Descrição da tabela e seu propósito no sistema';

COMMENT ON COLUMN public.nova_entidade.workspace_id IS 
  'OBRIGATÓRIO: Isolamento multi-tenant';

-- =====================================================
-- ✅ CHECKLIST PÓS-CRIAÇÃO
-- =====================================================
-- 
-- [ ] workspace_id é NOT NULL
-- [ ] workspace_id tem ON DELETE CASCADE
-- [ ] Indexes criados (mínimo: workspace_id)
-- [ ] RLS habilitado
-- [ ] Políticas criadas (SELECT, INSERT, UPDATE, DELETE)
-- [ ] Trigger updated_at criado
-- [ ] Service criado em src/services/
-- [ ] createWorkspaceQuery usado no service
-- [ ] Tipos TypeScript gerados
-- [ ] Teste de isolamento escrito
-- 
-- =====================================================
