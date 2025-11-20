-- Habilitar extensão pgcrypto para hash de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Inserir credenciais para todos os admins existentes
-- Senha temporária: Admin@2025!
-- IMPORTANTE: Esta senha deve ser trocada no primeiro login
INSERT INTO public.admin_credentials (user_id, admin_email, password_hash, first_login)
SELECT 
  pa.user_id,
  p.email,
  crypt('Admin@2025!', gen_salt('bf')), -- Hash bcrypt da senha temporária
  true -- Força troca de senha no primeiro login
FROM public.platform_admins pa
JOIN public.profiles p ON p.id = pa.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_credentials ac 
  WHERE ac.user_id = pa.user_id
);

-- Adicionar comentário para documentação
COMMENT ON TABLE public.admin_credentials IS 'Credenciais de login para administradores da plataforma. Senha inicial: Admin@2025! (deve ser trocada no primeiro login)';
