-- Criar funções RPC para gerenciar administradores da plataforma

-- Função para adicionar um administrador
CREATE OR REPLACE FUNCTION public.add_platform_admin(
  _user_id uuid,
  _role platform_role,
  _granted_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _admin_id uuid;
BEGIN
  -- Verificar se o usuário que está adicionando é super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _granted_by
    AND role = 'super_admin'::platform_role
  ) THEN
    RAISE EXCEPTION 'Apenas Super Admins podem adicionar administradores';
  END IF;

  -- Verificar se o usuário já é admin
  IF EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Usuário já é um administrador';
  END IF;

  -- Inserir novo admin
  INSERT INTO public.platform_admins (user_id, role, granted_by)
  VALUES (_user_id, _role, _granted_by)
  RETURNING id INTO _admin_id;

  RETURN _admin_id;
END;
$$;

-- Função para remover um administrador
CREATE OR REPLACE FUNCTION public.remove_platform_admin(
  _user_id uuid,
  _removed_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário que está removendo é super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _removed_by
    AND role = 'super_admin'::platform_role
  ) THEN
    RAISE EXCEPTION 'Apenas Super Admins podem remover administradores';
  END IF;

  -- Não permitir remover a si mesmo
  IF _user_id = _removed_by THEN
    RAISE EXCEPTION 'Você não pode remover seu próprio acesso de administrador';
  END IF;

  -- Remover admin
  DELETE FROM public.platform_admins
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Administrador não encontrado';
  END IF;
END;
$$;

-- Função para atualizar role de um administrador
CREATE OR REPLACE FUNCTION public.update_platform_admin_role(
  _user_id uuid,
  _new_role platform_role,
  _updated_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário que está atualizando é super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _updated_by
    AND role = 'super_admin'::platform_role
  ) THEN
    RAISE EXCEPTION 'Apenas Super Admins podem atualizar roles de administradores';
  END IF;

  -- Não permitir atualizar a própria role
  IF _user_id = _updated_by THEN
    RAISE EXCEPTION 'Você não pode alterar sua própria role de administrador';
  END IF;

  -- Atualizar role
  UPDATE public.platform_admins
  SET role = _new_role
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Administrador não encontrado';
  END IF;
END;
$$;

-- Adicionar coluna password_configured na tabela platform_admins se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'platform_admins'
    AND column_name = 'password_configured'
  ) THEN
    ALTER TABLE public.platform_admins
    ADD COLUMN password_configured boolean DEFAULT false;
  END IF;
END $$;