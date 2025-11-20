-- Adicionar campos de documentação e informações pessoais na tabela clients
ALTER TABLE public.clients
ADD COLUMN cpf TEXT,
ADD COLUMN rg TEXT,
ADD COLUMN nationality TEXT DEFAULT 'Brasileiro(a)',
ADD COLUMN occupation TEXT,
ADD COLUMN marital_status TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.clients.cpf IS 'CPF do cliente (formato: 000.000.000-00)';
COMMENT ON COLUMN public.clients.rg IS 'RG do cliente';
COMMENT ON COLUMN public.clients.nationality IS 'Nacionalidade do cliente';
COMMENT ON COLUMN public.clients.occupation IS 'Profissão do cliente';
COMMENT ON COLUMN public.clients.marital_status IS 'Estado civil do cliente';