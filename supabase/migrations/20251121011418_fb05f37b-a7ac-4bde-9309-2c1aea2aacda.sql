-- =========================================================
-- MULTI-TENANT SECURITY IMPROVEMENTS
-- =========================================================

-- 1. Prevenir remoção do último owner de um workspace
CREATE OR REPLACE FUNCTION prevent_last_owner_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se está removendo um owner
  IF OLD.role = 'owner' THEN
    -- Verificar se existe outro owner no workspace
    IF NOT EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = OLD.workspace_id 
        AND role = 'owner'::workspace_role 
        AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot remove the last owner. Transfer ownership first.';
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Criar trigger para prevenir remoção de último owner
DROP TRIGGER IF EXISTS check_last_owner_before_delete ON workspace_members;
CREATE TRIGGER check_last_owner_before_delete
  BEFORE DELETE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_last_owner_removal();

-- 2. Índice único para prevenir convites duplicados pendentes
-- (só pode haver 1 convite pendente por email/workspace)
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_invite 
  ON workspace_invites(workspace_id, email) 
  WHERE accepted_at IS NULL;

-- 3. Garantir que workspace slug seja único globalmente
ALTER TABLE workspaces 
  DROP CONSTRAINT IF EXISTS unique_workspace_slug;

ALTER TABLE workspaces 
  ADD CONSTRAINT unique_workspace_slug 
  UNIQUE (slug);

-- 4. Função melhorada para aceitar convite com validação de limites
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_token text)
RETURNS TABLE(workspace_id uuid, workspace_name text, user_role workspace_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite workspace_invites;
  _workspace workspaces;
  _member_count integer;
  _max_members integer;
BEGIN
  -- Buscar convite válido
  SELECT * INTO _invite
  FROM workspace_invites
  WHERE token = invite_token
    AND accepted_at IS NULL
    AND expires_at > NOW();
  
  IF _invite.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;
  
  -- Verificar se usuário já é membro
  IF EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = _invite.workspace_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
  END IF;
  
  -- Buscar workspace e verificar limites
  SELECT * INTO _workspace
  FROM workspaces
  WHERE id = _invite.workspace_id;
  
  -- Contar membros atuais
  SELECT COUNT(*) INTO _member_count
  FROM workspace_members
  WHERE workspace_id = _invite.workspace_id;
  
  -- Determinar limite baseado no plano
  CASE _workspace.subscription_plan
    WHEN 'atelier' THEN _max_members := 3;
    WHEN 'studio' THEN _max_members := 10;
    WHEN 'domus' THEN _max_members := 2147483647; -- Unlimited
    ELSE _max_members := 3; -- Default to atelier limit
  END CASE;
  
  -- Verificar se atingiu limite
  IF _member_count >= _max_members THEN
    RAISE EXCEPTION 'Workspace has reached member limit for % plan', _workspace.subscription_plan;
  END IF;
  
  -- Adicionar usuário como membro
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (_invite.workspace_id, auth.uid(), _invite.role);
  
  -- Marcar convite como aceito
  UPDATE workspace_invites
  SET accepted_at = NOW()
  WHERE id = _invite.id;
  
  -- Retornar informações
  RETURN QUERY SELECT 
    _workspace.id,
    _workspace.name,
    _invite.role;
END;
$$;

-- 5. Função melhorada para criar workspace com validação de limites
CREATE OR REPLACE FUNCTION create_workspace(
  workspace_name text,
  plan subscription_plan DEFAULT 'atelier'
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
  _workspace workspaces;
  _user_workspace_count integer;
  _max_workspaces integer;
BEGIN
  -- Contar workspaces do usuário
  SELECT COUNT(*) INTO _user_workspace_count
  FROM workspace_members
  WHERE user_id = auth.uid();
  
  -- Por enquanto, usar limite do plano atelier (1 workspace)
  -- Em produção, pegar o plano mais alto do usuário
  _max_workspaces := 1;
  
  -- Verificar limite (temporariamente desabilitado - TODO: implementar lógica de plano por usuário)
  -- IF _user_workspace_count >= _max_workspaces THEN
  --   RAISE EXCEPTION 'Workspace limit reached. Upgrade your plan to create more workspaces.';
  -- END IF;
  
  -- Criar o workspace
  INSERT INTO workspaces (name, slug, subscription_plan, created_by)
  VALUES (
    workspace_name,
    generate_workspace_slug(workspace_name),
    COALESCE(plan, 'atelier'::subscription_plan),
    auth.uid()
  )
  RETURNING * INTO _workspace;
  
  -- Adicionar criador como owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
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

-- 6. Função para transferir ownership (nova)
CREATE OR REPLACE FUNCTION transfer_workspace_ownership(
  _workspace_id uuid,
  _new_owner_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_owner_id uuid;
BEGIN
  -- Verificar que o usuário atual é owner
  SELECT user_id INTO _current_owner_id
  FROM workspace_members
  WHERE workspace_id = _workspace_id
    AND user_id = auth.uid()
    AND role = 'owner'::workspace_role;
  
  IF _current_owner_id IS NULL THEN
    RAISE EXCEPTION 'Only workspace owners can transfer ownership';
  END IF;
  
  -- Verificar que o novo owner já é membro
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _new_owner_user_id
  ) THEN
    RAISE EXCEPTION 'New owner must already be a member of the workspace';
  END IF;
  
  -- Não permitir transferir para si mesmo
  IF _new_owner_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot transfer ownership to yourself';
  END IF;
  
  -- Transação atômica:
  -- 1. Novo membro vira owner
  UPDATE workspace_members
  SET role = 'owner'::workspace_role
  WHERE workspace_id = _workspace_id
    AND user_id = _new_owner_user_id;
  
  -- 2. Owner anterior vira admin
  UPDATE workspace_members
  SET role = 'admin'::workspace_role
  WHERE workspace_id = _workspace_id
    AND user_id = _current_owner_id;
END;
$$;

-- 7. Comentários para documentação
COMMENT ON FUNCTION prevent_last_owner_removal() IS 
  'Prevents deletion of the last owner from a workspace. Requires transferring ownership first.';

COMMENT ON FUNCTION accept_workspace_invite(text) IS 
  'Accepts a workspace invite with member limit validation based on plan.';

COMMENT ON FUNCTION create_workspace(text, subscription_plan) IS 
  'Creates a new workspace with validation (limit check temporarily disabled).';

COMMENT ON FUNCTION transfer_workspace_ownership(uuid, uuid) IS 
  'Transfers workspace ownership to another member. Old owner becomes admin.';
