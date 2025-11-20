-- Adicionar campo para controlar se admin já definiu senha
ALTER TABLE public.platform_admins 
ADD COLUMN password_configured boolean DEFAULT false;

-- Criar função para verificar se admin precisa configurar senha
CREATE OR REPLACE FUNCTION public.admin_needs_password_setup(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT COALESCE(password_configured, false)
  FROM public.platform_admins
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Criar função para marcar senha como configurada
CREATE OR REPLACE FUNCTION public.mark_admin_password_configured(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.platform_admins
  SET password_configured = true
  WHERE user_id = _user_id
$$;