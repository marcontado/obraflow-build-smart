-- Criar bucket para logos de workspaces
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Políticas de storage para logos
CREATE POLICY "Members can view workspace logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-logos');

CREATE POLICY "Admins can upload workspace logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace-logos' AND
  (
    SELECT EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id::text = (storage.foldername(name))[1]
      AND (
        public.has_workspace_role(auth.uid(), w.id, 'owner'::workspace_role) OR
        public.has_workspace_role(auth.uid(), w.id, 'admin'::workspace_role)
      )
    )
  )
);

CREATE POLICY "Admins can update workspace logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workspace-logos' AND
  (
    SELECT EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id::text = (storage.foldername(name))[1]
      AND (
        public.has_workspace_role(auth.uid(), w.id, 'owner'::workspace_role) OR
        public.has_workspace_role(auth.uid(), w.id, 'admin'::workspace_role)
      )
    )
  )
);

CREATE POLICY "Admins can delete workspace logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace-logos' AND
  (
    SELECT EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id::text = (storage.foldername(name))[1]
      AND (
        public.has_workspace_role(auth.uid(), w.id, 'owner'::workspace_role) OR
        public.has_workspace_role(auth.uid(), w.id, 'admin'::workspace_role)
      )
    )
  )
);