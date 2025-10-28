-- Create project_activities table for independent Gantt chart
CREATE TABLE IF NOT EXISTS project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Progress & priority
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Optional task linking (future feature)
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- Dependencies (JSONB for flexibility)
  dependencies JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX idx_activities_project ON project_activities(project_id);
CREATE INDEX idx_activities_workspace ON project_activities(workspace_id);
CREATE INDEX idx_activities_dates ON project_activities(start_date, end_date);

-- RLS Policies
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Members can view workspace activities
CREATE POLICY "Members can view workspace activities"
  ON project_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = project_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Members can create workspace activities
CREATE POLICY "Members can create workspace activities"
  ON project_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = project_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Members can update workspace activities
CREATE POLICY "Members can update workspace activities"
  ON project_activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = project_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Members can delete workspace activities
CREATE POLICY "Members can delete workspace activities"
  ON project_activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = project_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_project_activities_updated_at
  BEFORE UPDATE ON project_activities
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Comment
COMMENT ON TABLE project_activities IS 'Project timeline activities for Gantt chart - independent from Kanban tasks';