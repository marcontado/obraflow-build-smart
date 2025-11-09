-- =====================================================
-- Script de Validação: Isolamento Multi-Tenant
-- =====================================================
-- 
-- Este script detecta violações de segurança na arquitetura
-- multi-tenant do banco de dados.
--
-- Execute periodicamente para garantir que novas tabelas
-- seguem os padrões de isolamento.
--

-- =====================================================
-- VALIDAÇÃO #1: Tabelas sem workspace_id
-- =====================================================

SELECT 
  t.table_name,
  'CRITICAL: Missing workspace_id column' as issue,
  'Tabela de negócio sem isolamento de workspace' as description
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  -- Excluir tabelas que legitimamente não precisam de workspace_id
  AND t.table_name NOT IN (
    'profiles',           -- Dados globais de usuário
    'platform_admins',    -- Admins da plataforma
    'subscriptions',      -- Assinaturas Stripe
    'workspaces',         -- A própria tabela de workspaces
    'workspace_members',  -- Relacionamento user-workspace
    'workspace_invites'   -- Convites pendentes
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = t.table_name
      AND c.column_name = 'workspace_id'
  )
ORDER BY t.table_name;

-- =====================================================
-- VALIDAÇÃO #2: workspace_id NULLABLE
-- =====================================================

SELECT 
  c.table_name,
  'CRITICAL: workspace_id is NULLABLE' as issue,
  'workspace_id deve ser NOT NULL para garantir isolamento' as description
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.column_name = 'workspace_id'
  AND c.is_nullable = 'YES'  -- Permite NULL
ORDER BY c.table_name;

-- =====================================================
-- VALIDAÇÃO #3: Tabelas sem RLS habilitado
-- =====================================================

SELECT 
  t.tablename,
  'HIGH: RLS not enabled' as issue,
  'Tabela com workspace_id mas sem RLS habilitado' as description
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = t.tablename
      AND c.column_name = 'workspace_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_class pc
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pc.relname = t.tablename
      AND pn.nspname = 'public'
      AND pc.relrowsecurity = true  -- RLS habilitado
  )
ORDER BY t.tablename;

-- =====================================================
-- VALIDAÇÃO #4: Tabelas sem políticas RLS
-- =====================================================

SELECT 
  t.tablename,
  'HIGH: Missing RLS policies' as issue,
  'Tabela com RLS habilitado mas sem políticas definidas' as description
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = t.tablename
      AND c.column_name = 'workspace_id'
  )
  AND EXISTS (
    -- Verificar que RLS está habilitado
    SELECT 1
    FROM pg_class pc
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pc.relname = t.tablename
      AND pn.nspname = 'public'
      AND pc.relrowsecurity = true
  )
  AND NOT EXISTS (
    -- Mas não tem políticas
    SELECT 1 
    FROM pg_policies pp
    WHERE pp.tablename = t.tablename
      AND pp.schemaname = 'public'
  )
ORDER BY t.tablename;

-- =====================================================
-- VALIDAÇÃO #5: Indexes ausentes em workspace_id
-- =====================================================

SELECT 
  t.tablename,
  'MEDIUM: Missing index on workspace_id' as issue,
  'Performance issue: queries por workspace serão lentas' as description
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = t.tablename
      AND c.column_name = 'workspace_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = t.tablename
      AND i.indexdef LIKE '%workspace_id%'
  )
ORDER BY t.tablename;

-- =====================================================
-- VALIDAÇÃO #6: Políticas sem is_workspace_member()
-- =====================================================

SELECT 
  pp.tablename,
  'MEDIUM: Policy may not enforce workspace isolation' as issue,
  'Política: ' || pp.policyname || ' não usa is_workspace_member()' as description
FROM pg_policies pp
WHERE pp.schemaname = 'public'
  AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = pp.tablename
      AND c.column_name = 'workspace_id'
  )
  -- Verificar se a definição não contém is_workspace_member
  AND pp.qual NOT LIKE '%is_workspace_member%'
  AND pp.with_check NOT LIKE '%is_workspace_member%'
  -- Excluir políticas para service role ou platform admins
  AND pp.policyname NOT LIKE '%service%role%'
  AND pp.policyname NOT LIKE '%platform%admin%'
ORDER BY pp.tablename, pp.policyname;

-- =====================================================
-- VALIDAÇÃO #7: Foreign keys sem ON DELETE CASCADE
-- =====================================================

SELECT 
  tc.table_name,
  'LOW: workspace_id FK without CASCADE' as issue,
  'FK: ' || tc.constraint_name || ' deveria ter ON DELETE CASCADE' as description
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'workspace_id'
  AND rc.delete_rule != 'CASCADE'
ORDER BY tc.table_name;

-- =====================================================
-- RESUMO DE VALIDAÇÃO
-- =====================================================

WITH validation_summary AS (
  -- Contar tabelas com problemas em cada categoria
  SELECT 'Missing workspace_id' as check_type, COUNT(*) as count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN ('profiles', 'platform_admins', 'subscriptions', 'workspaces', 'workspace_members', 'workspace_invites')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.table_name AND c.column_name = 'workspace_id'
    )
  
  UNION ALL
  
  SELECT 'Nullable workspace_id' as check_type, COUNT(*)
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.column_name = 'workspace_id'
    AND c.is_nullable = 'YES'
  
  UNION ALL
  
  SELECT 'RLS not enabled' as check_type, COUNT(*)
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.tablename AND c.column_name = 'workspace_id'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_class pc
      JOIN pg_namespace pn ON pn.oid = pc.relnamespace
      WHERE pc.relname = t.tablename AND pn.nspname = 'public' AND pc.relrowsecurity = true
    )
  
  UNION ALL
  
  SELECT 'Missing RLS policies' as check_type, COUNT(*)
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.tablename AND c.column_name = 'workspace_id'
    )
    AND EXISTS (
      SELECT 1 FROM pg_class pc
      JOIN pg_namespace pn ON pn.oid = pc.relnamespace
      WHERE pc.relname = t.tablename AND pn.nspname = 'public' AND pc.relrowsecurity = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies pp
      WHERE pp.tablename = t.tablename AND pp.schemaname = 'public'
    )
  
  UNION ALL
  
  SELECT 'Missing indexes' as check_type, COUNT(*)
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.tablename AND c.column_name = 'workspace_id'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_indexes i
      WHERE i.tablename = t.tablename AND i.indexdef LIKE '%workspace_id%'
    )
)
SELECT 
  check_type,
  count,
  CASE 
    WHEN count = 0 THEN '✅ OK'
    WHEN check_type IN ('Missing workspace_id', 'Nullable workspace_id', 'RLS not enabled') THEN '❌ CRITICAL'
    WHEN check_type IN ('Missing RLS policies') THEN '⚠️ HIGH'
    ELSE '⚡ MEDIUM'
  END as severity
FROM validation_summary
ORDER BY 
  CASE severity
    WHEN '❌ CRITICAL' THEN 1
    WHEN '⚠️ HIGH' THEN 2
    WHEN '⚡ MEDIUM' THEN 3
    ELSE 4
  END;

-- =====================================================
-- 📊 COMO INTERPRETAR OS RESULTADOS
-- =====================================================
--
-- ✅ OK (count = 0):
--   Nenhum problema encontrado nesta categoria
--
-- ❌ CRITICAL (count > 0):
--   DEVE ser corrigido imediatamente
--   Representa vulnerabilidade de segurança
--
-- ⚠️ HIGH (count > 0):
--   DEVE ser corrigido em breve
--   Sistema vulnerável mas com alguma proteção
--
-- ⚡ MEDIUM (count > 0):
--   DEVERIA ser corrigido
--   Pode causar problemas de performance ou segurança
--
-- =====================================================
