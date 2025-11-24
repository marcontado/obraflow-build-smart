-- ============================================
-- ENTREGAS E DEMANDAS - PROJECT DELIVERIES
-- ============================================

-- Criar bucket para fotos de entregas
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-photos', 'delivery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para anexos de entregas
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-attachments', 'delivery-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Tabela de entregas do projeto
CREATE TABLE IF NOT EXISTS public.project_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  project_id UUID NOT NULL,
  budget_item_id UUID,
  area_id UUID,
  
  delivery_date DATE NOT NULL,
  supplier_name TEXT NOT NULL,
  
  photos JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  status TEXT NOT NULL DEFAULT 'recebido',
  notes TEXT,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign keys
  CONSTRAINT fk_delivery_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_delivery_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_delivery_budget_item FOREIGN KEY (budget_item_id) REFERENCES public.budget_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_delivery_area FOREIGN KEY (area_id) REFERENCES public.project_areas(id) ON DELETE SET NULL,
  CONSTRAINT fk_delivery_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('recebido', 'conferido', 'armazenado', 'aplicado'))
);

-- Index para performance
CREATE INDEX idx_deliveries_workspace ON public.project_deliveries(workspace_id);
CREATE INDEX idx_deliveries_project ON public.project_deliveries(project_id);
CREATE INDEX idx_deliveries_date ON public.project_deliveries(delivery_date DESC);

-- Trigger para updated_at
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.project_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- RLS POLICIES - PROJECT DELIVERIES
-- ============================================

ALTER TABLE public.project_deliveries ENABLE ROW LEVEL SECURITY;

-- Members podem ver entregas do workspace
CREATE POLICY "Members can view workspace deliveries"
  ON public.project_deliveries
  FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem criar entregas
CREATE POLICY "Members can create workspace deliveries"
  ON public.project_deliveries
  FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id) 
    AND created_by = auth.uid()
  );

-- Members podem atualizar entregas
CREATE POLICY "Members can update workspace deliveries"
  ON public.project_deliveries
  FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Members podem deletar entregas
CREATE POLICY "Members can delete workspace deliveries"
  ON public.project_deliveries
  FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Platform admins podem ver todas as entregas
CREATE POLICY "Platform admins can view all deliveries"
  ON public.project_deliveries
  FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - STORAGE BUCKETS
-- ============================================

-- Delivery Photos (público)
CREATE POLICY "Members can upload delivery photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Members can update own delivery photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'delivery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Members can delete own delivery photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'delivery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view delivery photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'delivery-photos');

-- Delivery Attachments (privado)
CREATE POLICY "Members can upload delivery attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-attachments' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Members can view own delivery attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'delivery-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Members can update own delivery attachments"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'delivery-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Members can delete own delivery attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'delivery-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );