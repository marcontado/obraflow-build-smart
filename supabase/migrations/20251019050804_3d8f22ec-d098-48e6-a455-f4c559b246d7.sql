-- Criar enum para roles de administradores da plataforma
CREATE TYPE public.platform_role AS ENUM ('super_admin', 'support', 'analyst');

-- Criar tabela platform_admins
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role platform_role NOT NULL DEFAULT 'analyst',
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Inserir gmarcon850@gmail.com como super_admin
INSERT INTO public.platform_admins (user_id, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'gmarcon850@gmail.com'),
  'super_admin'
);

-- Função para verificar se é admin da plataforma
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user_id
  )
$$;

-- Função para obter role do admin
CREATE OR REPLACE FUNCTION public.get_platform_admin_role(_user_id uuid)
RETURNS platform_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.platform_admins
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Platform admins podem ver seus próprios registros
CREATE POLICY "Platform admins can view own record"
ON public.platform_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins podem gerenciar outros admins
CREATE POLICY "Super admins can manage admins"
ON public.platform_admins FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins podem ver todos os workspaces
CREATE POLICY "Platform admins can view all workspaces"
ON public.workspaces FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todos os membros
CREATE POLICY "Platform admins can view all workspace members"
ON public.workspace_members FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todos os projetos
CREATE POLICY "Platform admins can view all projects"
ON public.projects FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todas as subscriptions
CREATE POLICY "Platform admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todos os profiles
CREATE POLICY "Platform admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todos os clients
CREATE POLICY "Platform admins can view all clients"
ON public.clients FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todas as tasks
CREATE POLICY "Platform admins can view all tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Admins podem ver todas as project areas
CREATE POLICY "Platform admins can view all project areas"
ON public.project_areas FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));