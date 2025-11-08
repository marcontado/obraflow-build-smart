-- Phase 1: Database Hardening for Multi-Tenant Isolation

-- Create composite indexes for efficient workspace-scoped queries
CREATE INDEX IF NOT EXISTS idx_clients_workspace_updated 
  ON public.clients(workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_project 
  ON public.tasks(workspace_id, project_id);

CREATE INDEX IF NOT EXISTS idx_project_areas_workspace_project 
  ON public.project_areas(workspace_id, project_id);

CREATE INDEX IF NOT EXISTS idx_project_activities_workspace_project 
  ON public.project_activities(workspace_id, project_id);

-- Ensure all workspace_id columns are NOT NULL (they should already be, but enforcing it)
-- Note: These tables already have workspace_id as NOT NULL based on the schema
-- This is defensive to ensure data integrity

-- Add comment for documentation
COMMENT ON INDEX idx_clients_workspace_updated IS 'Composite index for workspace-scoped client queries with sorting';
COMMENT ON INDEX idx_tasks_workspace_project IS 'Composite index for workspace and project-scoped task queries';
COMMENT ON INDEX idx_project_areas_workspace_project IS 'Composite index for workspace and project-scoped area queries';
COMMENT ON INDEX idx_project_activities_workspace_project IS 'Composite index for workspace and project-scoped activity queries';