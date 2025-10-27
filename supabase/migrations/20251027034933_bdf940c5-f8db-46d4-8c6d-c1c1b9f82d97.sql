-- Função para criar workspace e adicionar criador como owner (resolve RLS)
CREATE OR REPLACE FUNCTION public.create_workspace(
  workspace_name TEXT,
  plan subscription_plan DEFAULT 'atelier'::subscription_plan
)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  subscription_plan subscription_plan,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  logo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _workspace public.workspaces;
BEGIN
  -- Criar o workspace
  INSERT INTO public.workspaces (name, slug, subscription_plan, created_by)
  VALUES (
    workspace_name,
    public.generate_workspace_slug(workspace_name),
    COALESCE(plan, 'atelier'::subscription_plan),
    auth.uid()
  )
  RETURNING * INTO _workspace;
  
  -- Adicionar criador como owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (_workspace.id, auth.uid(), 'owner'::workspace_role);
  
  -- Retornar o workspace criado
  RETURN QUERY SELECT 
    _workspace.id,
    _workspace.name,
    _workspace.slug,
    _workspace.subscription_plan,
    _workspace.created_by,
    _workspace.created_at,
    _workspace.updated_at,
    _workspace.logo_url;
END;
$$;

-- Função para aceitar convite de workspace (resolve RLS)
CREATE OR REPLACE FUNCTION public.accept_workspace_invite(invite_token TEXT)
RETURNS TABLE(
  workspace_id uuid,
  workspace_name text,
  user_role workspace_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite public.workspace_invites;
  _workspace_id uuid;
  _workspace_name text;
  _user_role workspace_role;
BEGIN
  -- Buscar convite válido
  SELECT * INTO _invite
  FROM public.workspace_invites
  WHERE token = invite_token
    AND accepted_at IS NULL
    AND expires_at > NOW();
  
  -- Validar se convite existe e é válido
  IF _invite.id IS NULL THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;
  
  -- Verificar se usuário já é membro
  IF EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _invite.workspace_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Você já é membro deste workspace';
  END IF;
  
  -- Adicionar usuário como membro
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (_invite.workspace_id, auth.uid(), _invite.role);
  
  -- Marcar convite como aceito
  UPDATE public.workspace_invites
  SET accepted_at = NOW()
  WHERE id = _invite.id;
  
  -- Buscar informações do workspace
  SELECT w.id, w.name INTO _workspace_id, _workspace_name
  FROM public.workspaces w
  WHERE w.id = _invite.workspace_id;
  
  _user_role := _invite.role;
  
  -- Retornar informações
  RETURN QUERY SELECT _workspace_id, _workspace_name, _user_role;
END;
$$;