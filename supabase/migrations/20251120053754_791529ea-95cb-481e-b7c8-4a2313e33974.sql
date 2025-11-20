-- ============================================================================
-- CORREÇÃO DAS POLÍTICAS RLS DO STORAGE
-- ============================================================================
-- Problema: As políticas estavam usando p.name em vez de storage.objects.name
-- Solução: Usar split_part(storage.objects.name, '/', 1) para extrair o projectId

-- Remover políticas incorretas do bucket project-moodboards
DROP POLICY IF EXISTS "Members can view workspace project moodboards" ON storage.objects;
DROP POLICY IF EXISTS "Members can upload workspace project moodboards" ON storage.objects;
DROP POLICY IF EXISTS "Members can delete workspace project moodboards" ON storage.objects;

-- Remover políticas incorretas do bucket project-technical-files
DROP POLICY IF EXISTS "Members can view workspace project technical files" ON storage.objects;
DROP POLICY IF EXISTS "Members can upload workspace project technical files" ON storage.objects;
DROP POLICY IF EXISTS "Members can delete workspace project technical files" ON storage.objects;

-- ============================================================================
-- POLÍTICAS CORRETAS PARA PROJECT-MOODBOARDS
-- ============================================================================

-- Visualizar moodboards
CREATE POLICY "Members can view workspace project moodboards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-moodboards' 
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);

-- Fazer upload de moodboards
CREATE POLICY "Members can upload workspace project moodboards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-moodboards'
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);

-- Deletar moodboards
CREATE POLICY "Members can delete workspace project moodboards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-moodboards'
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS CORRETAS PARA PROJECT-TECHNICAL-FILES
-- ============================================================================

-- Visualizar arquivos técnicos
CREATE POLICY "Members can view workspace project technical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-technical-files'
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);

-- Fazer upload de arquivos técnicos
CREATE POLICY "Members can upload workspace project technical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-technical-files'
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);

-- Deletar arquivos técnicos
CREATE POLICY "Members can delete workspace project technical files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-technical-files'
  AND EXISTS (
    SELECT 1 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
    AND wm.user_id = auth.uid()
  )
);