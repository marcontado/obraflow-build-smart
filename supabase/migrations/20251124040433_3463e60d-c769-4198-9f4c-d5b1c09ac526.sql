-- Adicionar campos para vincular fornecedor e registrar recebimento na tabela project_deliveries

-- Adicionar coluna para vincular com a tabela partners (fornecedores)
ALTER TABLE public.project_deliveries
ADD COLUMN partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;

-- Adicionar coluna para registrar quem recebeu a entrega
ALTER TABLE public.project_deliveries
ADD COLUMN received_by text;

-- Adicionar coluna para assinatura de quem recebeu (pode ser texto ou URL de imagem)
ALTER TABLE public.project_deliveries
ADD COLUMN received_signature text;

-- Criar índice para melhor performance nas buscas por fornecedor
CREATE INDEX idx_project_deliveries_partner_id ON public.project_deliveries(partner_id);

-- Comentários para documentação
COMMENT ON COLUMN public.project_deliveries.partner_id IS 'Vínculo com fornecedor cadastrado na tabela partners';
COMMENT ON COLUMN public.project_deliveries.received_by IS 'Nome de quem recebeu o material';
COMMENT ON COLUMN public.project_deliveries.received_signature IS 'Assinatura de quem recebeu (texto ou URL de imagem)';