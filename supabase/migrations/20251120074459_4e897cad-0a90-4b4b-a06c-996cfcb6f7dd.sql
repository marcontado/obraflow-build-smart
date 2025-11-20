-- Função para verificar senha de admin usando crypt do extensions.pgcrypto
CREATE OR REPLACE FUNCTION public.verify_admin_password(_admin_email TEXT, _password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_credentials
    WHERE admin_email = _admin_email
      AND password_hash = extensions.crypt(_password, password_hash)
  );
END;
$$;

-- Função para atualizar senha de admin usando crypt do extensions.pgcrypto
CREATE OR REPLACE FUNCTION public.update_admin_password(_user_id UUID, _new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.admin_credentials
  SET 
    password_hash = extensions.crypt(_new_password, extensions.gen_salt('bf')),
    first_login = false,
    reset_token = NULL,
    reset_token_expires_at = NULL,
    updated_at = NOW()
  WHERE user_id = _user_id;
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION public.verify_admin_password IS 'Verifica se a senha fornecida corresponde ao hash armazenado para o admin';
COMMENT ON FUNCTION public.update_admin_password IS 'Atualiza a senha de um admin gerando novo hash bcrypt';