-- Criar função RPC para retornar projetos e tarefas que vencem amanhã
-- Esta função pode ser chamada pela Lambda AWS usando a chave anon
CREATE OR REPLACE FUNCTION public.get_expiring_deadlines()
RETURNS TABLE (
  type text,
  item_id uuid,
  item_name text,
  due_date date,
  workspace_id uuid,
  responsible_user_id uuid,
  responsible_name text,
  responsible_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Projetos que vencem amanhã
  SELECT 
    'project'::text as type,
    p.id as item_id,
    p.name as item_name,
    p.end_date as due_date,
    p.workspace_id,
    p.project_manager_id as responsible_user_id,
    pr.full_name as responsible_name,
    pr.email as responsible_email
  FROM projects p
  LEFT JOIN profiles pr ON pr.id = p.project_manager_id
  WHERE p.end_date = CURRENT_DATE + INTERVAL '1 day'
    AND p.status IN ('planning', 'in_progress')
    AND p.project_manager_id IS NOT NULL
  
  UNION ALL
  
  -- Tarefas que vencem amanhã
  SELECT 
    'task'::text as type,
    t.id as item_id,
    t.title as item_name,
    t.due_date,
    t.workspace_id,
    t.assigned_to as responsible_user_id,
    pr.full_name as responsible_name,
    pr.email as responsible_email
  FROM tasks t
  LEFT JOIN profiles pr ON pr.id = t.assigned_to
  WHERE t.due_date = CURRENT_DATE + INTERVAL '1 day'
    AND t.status != 'done'
    AND t.assigned_to IS NOT NULL
$$;

-- Permitir que o role anon execute esta função
GRANT EXECUTE ON FUNCTION public.get_expiring_deadlines() TO anon;

-- Comentário explicando o propósito da função
COMMENT ON FUNCTION public.get_expiring_deadlines() IS 
'Retorna projetos e tarefas que vencem amanhã com dados dos responsáveis. Pode ser chamada pela AWS Lambda usando a chave anon para envio de emails de lembrete.';