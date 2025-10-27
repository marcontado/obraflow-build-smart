-- Corrigir typo no enum subscription_plan: dommus -> domus

-- Primeiro, atualizar qualquer workspace que esteja usando o valor incorreto
UPDATE workspaces 
SET subscription_plan = 'atelier' 
WHERE subscription_plan = 'dommus';

-- Remover o default temporariamente
ALTER TABLE workspaces 
  ALTER COLUMN subscription_plan DROP DEFAULT;

-- Renomear o enum antigo
ALTER TYPE subscription_plan RENAME TO subscription_plan_old;

-- Criar novo enum com valores corretos
CREATE TYPE subscription_plan AS ENUM ('atelier', 'studio', 'domus');

-- Atualizar a coluna para usar o novo enum
ALTER TABLE workspaces 
  ALTER COLUMN subscription_plan TYPE subscription_plan 
  USING subscription_plan::text::subscription_plan;

-- Restaurar o default com o valor correto
ALTER TABLE workspaces 
  ALTER COLUMN subscription_plan SET DEFAULT 'atelier'::subscription_plan;

-- Remover o enum antigo
DROP TYPE subscription_plan_old;