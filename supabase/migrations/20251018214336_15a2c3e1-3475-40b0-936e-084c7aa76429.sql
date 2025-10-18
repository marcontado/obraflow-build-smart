-- Add spent column to project_areas
ALTER TABLE public.project_areas ADD COLUMN IF NOT EXISTS spent numeric DEFAULT 0;

-- Create function to update project spent based on project_areas
CREATE OR REPLACE FUNCTION public.update_project_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET spent = (
    SELECT COALESCE(SUM(spent), 0)
    FROM public.project_areas
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project_areas INSERT/UPDATE/DELETE
DROP TRIGGER IF EXISTS trigger_update_project_spent ON public.project_areas;
CREATE TRIGGER trigger_update_project_spent
AFTER INSERT OR UPDATE OR DELETE ON public.project_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_project_spent();