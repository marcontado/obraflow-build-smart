-- Criar tabela de credenciais admin separadas
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_login BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT admin_credentials_user_id_unique UNIQUE(user_id)
);

-- Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON public.admin_credentials(admin_email);

-- RLS para admin_credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver suas próprias credenciais
CREATE POLICY "Admins can view own credentials"
ON public.admin_credentials
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Remover campo password_configured da tabela platform_admins
ALTER TABLE public.platform_admins 
DROP COLUMN IF EXISTS password_configured;

-- Função para atualizar updated_at em admin_credentials
CREATE OR REPLACE FUNCTION public.handle_admin_credentials_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_admin_credentials_updated_at ON public.admin_credentials;
CREATE TRIGGER trigger_admin_credentials_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_credentials_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.admin_credentials IS 'Credenciais de autenticação separadas para o painel administrativo';
COMMENT ON COLUMN public.admin_credentials.user_id IS 'Vinculação com usuário Supabase';
COMMENT ON COLUMN public.admin_credentials.admin_email IS 'Email específico para acesso admin (diferente do email do sistema)';
COMMENT ON COLUMN public.admin_credentials.password_hash IS 'Senha hasheada com bcrypt';
COMMENT ON COLUMN public.admin_credentials.first_login IS 'Flag para forçar troca de senha no primeiro acesso';