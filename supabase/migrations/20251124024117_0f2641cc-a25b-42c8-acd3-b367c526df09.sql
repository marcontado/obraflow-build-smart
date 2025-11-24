-- ============================================================================
-- MIGRATION: Sistema de Controle Orçamentário
-- Cria tabelas budget_categories e budget_items com isolamento multi-tenant
-- ============================================================================

-- ============================================================================
-- 1. TABELA: budget_categories (Categorias/Módulos de Orçamento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign Keys
  CONSTRAINT fk_budget_categories_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) 
    ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_budget_categories_workspace 
  ON public.budget_categories(workspace_id);
CREATE INDEX idx_budget_categories_sort 
  ON public.budget_categories(workspace_id, sort_order);

-- Comentários
COMMENT ON TABLE public.budget_categories IS 'Categorias/módulos de orçamento (Revestimentos, Iluminação, Marmoaria, etc)';
COMMENT ON COLUMN public.budget_categories.workspace_id IS 'ID do workspace - isolamento multi-tenant';

-- ============================================================================
-- 2. TABELA: budget_items (Itens Detalhados de Orçamento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  project_id UUID NOT NULL,
  area_id UUID,
  category_id UUID NOT NULL,
  
  -- Informações Básicas
  item_name TEXT NOT NULL,
  executor TEXT,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'cotado', 'comprado', 'aplicado')),
  
  -- Medições
  measurement_unit TEXT DEFAULT 'm²',
  measurement_base NUMERIC(12,2),
  measurement_with_margin NUMERIC(12,2),
  measurement_purchased NUMERIC(12,2),
  quantity NUMERIC(12,2),
  
  -- Loja Principal
  store_name TEXT,
  product_code TEXT,
  unit_price NUMERIC(12,2),
  store_link TEXT,
  
  -- Loja Alternativa (para comparação)
  alternative_store_name TEXT,
  alternative_product_code TEXT,
  alternative_unit_price NUMERIC(12,2),
  alternative_store_link TEXT,
  
  -- Totalizadores
  selected_store TEXT DEFAULT 'main' CHECK (selected_store IN ('main', 'alternative')),
  total_price NUMERIC(12,2),
  
  -- Controle
  deadline DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign Keys
  CONSTRAINT fk_budget_items_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_items_project 
    FOREIGN KEY (project_id) 
    REFERENCES public.projects(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_items_area 
    FOREIGN KEY (area_id) 
    REFERENCES public.project_areas(id) 
    ON DELETE SET NULL,
  CONSTRAINT fk_budget_items_category 
    FOREIGN KEY (category_id) 
    REFERENCES public.budget_categories(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_items_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX idx_budget_items_workspace 
  ON public.budget_items(workspace_id);
CREATE INDEX idx_budget_items_project 
  ON public.budget_items(project_id);
CREATE INDEX idx_budget_items_area 
  ON public.budget_items(area_id);
CREATE INDEX idx_budget_items_category 
  ON public.budget_items(category_id);
CREATE INDEX idx_budget_items_status 
  ON public.budget_items(workspace_id, status);

-- Comentários
COMMENT ON TABLE public.budget_items IS 'Itens detalhados de orçamento com controle completo de custos';
COMMENT ON COLUMN public.budget_items.workspace_id IS 'ID do workspace - isolamento multi-tenant';

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) - budget_categories
-- ============================================================================
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Members can view workspace categories
CREATE POLICY "Members can view workspace categories"
  ON public.budget_categories
  FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members can create workspace categories
CREATE POLICY "Members can create workspace categories"
  ON public.budget_categories
  FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

-- Members can update workspace categories
CREATE POLICY "Members can update workspace categories"
  ON public.budget_categories
  FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members can delete workspace categories
CREATE POLICY "Members can delete workspace categories"
  ON public.budget_categories
  FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins can view all categories
CREATE POLICY "Platform admins can view all categories"
  ON public.budget_categories
  FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - budget_items
-- ============================================================================
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Members can view workspace budget items
CREATE POLICY "Members can view workspace budget items"
  ON public.budget_items
  FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members can create workspace budget items
CREATE POLICY "Members can create workspace budget items"
  ON public.budget_items
  FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id) 
    AND created_by = auth.uid()
  );

-- Members can update workspace budget items
CREATE POLICY "Members can update workspace budget items"
  ON public.budget_items
  FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members can delete workspace budget items
CREATE POLICY "Members can delete workspace budget items"
  ON public.budget_items
  FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins can view all budget items
CREATE POLICY "Platform admins can view all budget items"
  ON public.budget_items
  FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- ============================================================================
-- 5. TRIGGERS - updated_at automático
-- ============================================================================
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. FUNÇÃO E TRIGGER: Atualizar spent das áreas quando items mudarem
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_area_spent_from_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_area_id uuid;
BEGIN
  -- Determinar qual área foi afetada
  IF TG_OP = 'DELETE' THEN
    affected_area_id := OLD.area_id;
  ELSE
    affected_area_id := NEW.area_id;
  END IF;
  
  -- Se não há área vinculada, não fazer nada
  IF affected_area_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Atualizar o spent da área somando todos os itens com status 'comprado' ou 'aplicado'
  UPDATE public.project_areas
  SET spent = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM public.budget_items
    WHERE area_id = affected_area_id
      AND status IN ('comprado', 'aplicado')
      AND total_price IS NOT NULL
  )
  WHERE id = affected_area_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para atualizar spent quando item é inserido, atualizado ou deletado
CREATE TRIGGER sync_area_spent_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_area_spent_from_items();

-- ============================================================================
-- 7. SEED: Categorias Padrão
-- ============================================================================
-- Nota: As categorias padrão serão inseridas por workspace quando necessário
-- Este é apenas um comentário de referência das categorias sugeridas:
--
-- Categorias padrão:
-- 1. Revestimentos (color: #ef4444, icon: 'Layers')
-- 2. Iluminação (color: #f59e0b, icon: 'Lightbulb')
-- 3. Marmoaria (color: #8b5cf6, icon: 'Square')
-- 4. Marcenaria (color: #84cc16, icon: 'Hammer')
-- 5. Materiais e Equipamentos (color: #06b6d4, icon: 'Package')
-- 6. Instalações Hidráulicas (color: #3b82f6, icon: 'Droplet')
-- 7. Instalações Elétricas (color: #eab308, icon: 'Zap')
-- 8. Pintura (color: #ec4899, icon: 'Paintbrush')
-- 9. Acabamentos (color: #14b8a6, icon: 'Sparkles')
-- 10. Mobiliário (color: #a855f7, icon: 'Armchair')
-- 11. Paisagismo (color: #22c55e, icon: 'Trees')
-- 12. Geral/Outros (color: #64748b, icon: 'MoreHorizontal')