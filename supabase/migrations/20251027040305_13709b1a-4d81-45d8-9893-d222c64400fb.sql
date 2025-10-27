-- Drop existing INSERT policy if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workspaces' 
      AND policyname = 'Authenticated users can create workspaces'
  ) THEN
    DROP POLICY "Authenticated users can create workspaces" ON public.workspaces;
  END IF;
END $$;

-- Create new INSERT policy that works with SECURITY DEFINER functions
CREATE POLICY "Users can create own workspaces"
ON public.workspaces
FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()
);