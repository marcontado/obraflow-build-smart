-- Adicionar novos campos à tabela projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('residential', 'commercial', 'corporate', 'interior', 'renovation', 'other')),
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS briefing JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS moodboard JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_files JSONB DEFAULT '[]'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN public.projects.type IS 'Tipo de projeto: residential, commercial, corporate, interior, renovation, other';
COMMENT ON COLUMN public.projects.location IS 'Localização física do projeto';
COMMENT ON COLUMN public.projects.briefing IS 'JSONB contendo: goal, style, audience, needs, restrictions, preferred_materials, references_links';
COMMENT ON COLUMN public.projects.moodboard IS 'Array JSONB de referências visuais: [{url, description, tags, file_name}]';
COMMENT ON COLUMN public.projects.technical_files IS 'Array JSONB de arquivos técnicos: [{file_url, category, notes, file_name, file_size}]';

-- Criar bucket para imagens de moodboard (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-moodboards', 'project-moodboards', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para arquivos técnicos (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-technical-files', 'project-technical-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para project-moodboards
CREATE POLICY "Members can view workspace project moodboards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-moodboards' 
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);

CREATE POLICY "Members can upload workspace project moodboards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-moodboards'
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);

CREATE POLICY "Members can delete workspace project moodboards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-moodboards'
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);

-- RLS Policies para project-technical-files
CREATE POLICY "Members can view workspace project technical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-technical-files'
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);

CREATE POLICY "Members can upload workspace project technical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-technical-files'
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);

CREATE POLICY "Members can delete workspace project technical files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-technical-files'
  AND auth.uid() IN (
    SELECT wm.user_id FROM workspace_members wm
    JOIN projects p ON p.workspace_id = wm.workspace_id
    WHERE SPLIT_PART(name, '/', 1) = p.id::text
  )
);