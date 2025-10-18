-- FASE 2: MULTI-TENANCY (WORKSPACES)
-- Criar enums, tabelas, funções, RLS policies e migrar dados existentes

-- ============================================================================
-- 1. CRIAR ENUMS
-- ============================================================================

CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.subscription_plan AS ENUM ('atelier', 'studio', 'dommus');

-- ============================================================================
-- 2. CRIAR FUNÇÃO PARA GERAR SLUG ÚNICO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_workspace_slug(workspace_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Normalizar: lowercase, remover acentos, substituir espaços/especiais por hífen
  base_slug := lower(trim(workspace_name));
  base_slug := translate(base_slug, 
    'áàâãäéèêëíìîïóòôõöúùûüçñ', 
    'aaaaaeeeeiiiioooooouuuucn');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  -- Garantir unicidade
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- ============================================================================
-- 3. CRIAR TABELAS DE WORKSPACES
-- ============================================================================

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  subscription_plan subscription_plan DEFAULT 'atelier' NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role workspace_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role workspace_role DEFAULT 'member' NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, email)
);

-- ============================================================================
-- 4. ADICIONAR workspace_id NAS TABELAS EXISTENTES
-- ============================================================================

ALTER TABLE public.clients ADD COLUMN workspace_id UUID;
ALTER TABLE public.projects ADD COLUMN workspace_id UUID;
ALTER TABLE public.tasks ADD COLUMN workspace_id UUID;
ALTER TABLE public.project_areas ADD COLUMN workspace_id UUID;

-- ============================================================================
-- 5. MIGRAR DADOS EXISTENTES
-- ============================================================================

-- Criar workspace "Minha Organização" para cada usuário com dados
INSERT INTO public.workspaces (name, slug, created_by, subscription_plan)
SELECT 
  'Minha Organização' as name,
  'minha-organizacao-' || p.id::TEXT as slug,
  p.id as created_by,
  'atelier' as subscription_plan
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.projects WHERE created_by = p.id
  UNION
  SELECT 1 FROM public.clients WHERE created_by = p.id
);

-- Adicionar usuários como owners de seus workspaces
INSERT INTO public.workspace_members (workspace_id, user_id, role)
SELECT w.id, w.created_by, 'owner'
FROM public.workspaces w;

-- Migrar clients
UPDATE public.clients c
SET workspace_id = (
  SELECT w.id 
  FROM public.workspaces w 
  WHERE w.created_by = c.created_by 
  LIMIT 1
)
WHERE c.created_by IS NOT NULL;

-- Migrar projects
UPDATE public.projects p
SET workspace_id = (
  SELECT w.id 
  FROM public.workspaces w 
  WHERE w.created_by = p.created_by 
  LIMIT 1
)
WHERE p.created_by IS NOT NULL;

-- Migrar tasks (através do project_id)
UPDATE public.tasks t
SET workspace_id = (
  SELECT p.workspace_id 
  FROM public.projects p 
  WHERE p.id = t.project_id
)
WHERE t.project_id IS NOT NULL;

-- Migrar project_areas (através do project_id)
UPDATE public.project_areas pa
SET workspace_id = (
  SELECT p.workspace_id 
  FROM public.projects p 
  WHERE p.id = pa.project_id
)
WHERE pa.project_id IS NOT NULL;

-- ============================================================================
-- 6. TORNAR workspace_id OBRIGATÓRIO E CRIAR FOREIGN KEYS
-- ============================================================================

ALTER TABLE public.clients 
  ALTER COLUMN workspace_id SET NOT NULL,
  ADD CONSTRAINT fk_clients_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.projects 
  ALTER COLUMN workspace_id SET NOT NULL,
  ADD CONSTRAINT fk_projects_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.tasks 
  ALTER COLUMN workspace_id SET NOT NULL,
  ADD CONSTRAINT fk_tasks_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.project_areas 
  ALTER COLUMN workspace_id SET NOT NULL,
  ADD CONSTRAINT fk_project_areas_workspace 
    FOREIGN KEY (workspace_id) 
    REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- ============================================================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX idx_clients_workspace_id ON public.clients(workspace_id);
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX idx_project_areas_workspace_id ON public.project_areas(workspace_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_invites_token ON public.workspace_invites(token);

-- ============================================================================
-- 8. CRIAR FUNÇÕES HELPER PARA RLS (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(
  _user_id UUID, 
  _workspace_id UUID, 
  _role workspace_role
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id 
      AND workspace_id = _workspace_id 
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.count_user_workspaces(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.workspace_members
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.count_workspace_members(_workspace_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.workspace_members
  WHERE workspace_id = _workspace_id
$$;

CREATE OR REPLACE FUNCTION public.count_workspace_projects(_workspace_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.projects
  WHERE workspace_id = _workspace_id
    AND status IN ('planning', 'in_progress')
$$;

-- ============================================================================
-- 9. RLS POLICIES PARA WORKSPACES
-- ============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their workspaces"
ON public.workspaces FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Owners and admins can update workspaces"
ON public.workspaces FOR UPDATE
TO authenticated
USING (
  public.has_workspace_role(auth.uid(), id, 'owner') OR
  public.has_workspace_role(auth.uid(), id, 'admin')
);

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can delete workspaces"
ON public.workspaces FOR DELETE
TO authenticated
USING (public.has_workspace_role(auth.uid(), id, 'owner'));

-- ============================================================================
-- 10. RLS POLICIES PARA WORKSPACE_MEMBERS
-- ============================================================================

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Owners and admins can manage members"
ON public.workspace_members FOR ALL
TO authenticated
USING (
  public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR
  public.has_workspace_role(auth.uid(), workspace_id, 'admin')
);

-- ============================================================================
-- 11. RLS POLICIES PARA WORKSPACE_INVITES
-- ============================================================================

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace invites"
ON public.workspace_invites FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can manage invites"
ON public.workspace_invites FOR ALL
TO authenticated
USING (
  public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR
  public.has_workspace_role(auth.uid(), workspace_id, 'admin')
);

-- ============================================================================
-- 12. ATUALIZAR RLS POLICIES DAS TABELAS EXISTENTES
-- ============================================================================

-- CLIENTS
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update their clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete their clients" ON public.clients;

CREATE POLICY "Members can view workspace clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create workspace clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_member(auth.uid(), workspace_id) AND
  created_by = auth.uid()
);

CREATE POLICY "Members can update workspace clients"
ON public.clients FOR UPDATE
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete workspace clients"
ON public.clients FOR DELETE
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

-- PROJECTS
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete their projects" ON public.projects;

CREATE POLICY "Members can view workspace projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create workspace projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_member(auth.uid(), workspace_id) AND
  created_by = auth.uid()
);

CREATE POLICY "Members can update workspace projects"
ON public.projects FOR UPDATE
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete workspace projects"
ON public.projects FOR DELETE
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

-- TASKS
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete their tasks" ON public.tasks;

CREATE POLICY "Members can view workspace tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create workspace tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_member(auth.uid(), workspace_id) AND
  created_by = auth.uid()
);

CREATE POLICY "Members can update workspace tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id) AND
  (created_by = auth.uid() OR assigned_to = auth.uid())
);

CREATE POLICY "Members can delete workspace tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id) AND
  created_by = auth.uid()
);

-- PROJECT_AREAS
DROP POLICY IF EXISTS "Authenticated users can manage project areas" ON public.project_areas;
DROP POLICY IF EXISTS "Authenticated users can view project areas" ON public.project_areas;

CREATE POLICY "Members can view workspace project areas"
ON public.project_areas FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can manage workspace project areas"
ON public.project_areas FOR ALL
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

-- ============================================================================
-- 13. TRIGGER PARA ATUALIZAR updated_at EM WORKSPACES
-- ============================================================================

CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();