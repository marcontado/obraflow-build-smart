-- Fix update_admin_password function to only update existing columns
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
    updated_at = NOW()
  WHERE user_id = _user_id;
END;
$$;

COMMENT ON FUNCTION public.update_admin_password IS 'Atualiza a senha de um admin gerando novo hash bcrypt';