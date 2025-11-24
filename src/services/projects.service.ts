import { checkAndNotifyExpiringProjectsAndTasks } from "./notificationsCron.service";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ProjectWizardData } from "@/schemas/project.schema";
import type { MoodboardItem, TechnicalFile } from "@/types/project.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export const projectsService = {
  async getAll(workspaceId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients!projects_client_id_fkey(name)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getById(id: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients!projects_client_id_fkey(name), project_areas(*)")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();

    return { data, error };
  },

  async create(project: ProjectInsert, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...project, created_by: user?.id, workspace_id: workspaceId })
      .select()
      .single();
    if (data?.id) {
      await checkAndNotifyExpiringProjectsAndTasks({ projectId: data.id });
    }
    return { data, error };
  },

  async update(id: string, updates: ProjectUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();
    if (data?.id) {
      await checkAndNotifyExpiringProjectsAndTasks({ projectId: data.id });
    }
    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    return { error };
  },

  async getStats(workspaceId: string) {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("status, budget, spent")
      .eq("workspace_id", workspaceId);

    if (error) return { stats: null, error };

    const stats = {
      total: projects.length,
      active: projects.filter((p) => p.status === "in_progress").length,
      completed: projects.filter((p) => p.status === "completed").length,
      totalBudget: projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0),
      totalSpent: projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0),
    };

    return { stats, error: null };
  },

  async calculateProjectProgress(projectId: string, workspaceId: string) {
    try {
      // Get all tasks for the project
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("status")
        .eq("project_id", projectId)
        .eq("workspace_id", workspaceId);

      if (tasksError) throw tasksError;
      if (!tasks || tasks.length === 0) return { progress: 0, error: null };

      // Calculate progress based on completed tasks
      const completedTasks = tasks.filter((t) => t.status === "done").length;
      const progress = Math.round((completedTasks / tasks.length) * 100);

      // Update project progress
      const { error: updateError } = await supabase
        .from("projects")
        .update({ progress })
        .eq("id", projectId)
        .eq("workspace_id", workspaceId);

      if (updateError) throw updateError;

      return { progress, error: null };
    } catch (error: any) {
      return { progress: null, error };
    }
  },

  async createWithWizardData(
    projectData: ProjectWizardData,
    moodboardItems: MoodboardItem[],
    technicalFiles: TechnicalFile[],
    workspaceId: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const projectInsert: any = {
      name: projectData.name,
      description: projectData.description || null,
      client_id: projectData.client_id || null,
      status: projectData.status,
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      progress: projectData.progress || 0,
      type: projectData.type || null,
      location: projectData.location || null,
      briefing: projectData.briefing || {},
      moodboard: moodboardItems as any,
      technical_files: technicalFiles as any,
      created_by: user?.id,
      workspace_id: workspaceId,
    };

    const { data, error } = await supabase
      .from("projects")
      .insert(projectInsert)
      .select()
      .single();

    if (data?.id) {
      await checkAndNotifyExpiringProjectsAndTasks({ projectId: data.id });
    }

    return { data, error };
  },

  async updateWithWizardData(
    id: string,
    projectData: ProjectWizardData,
    moodboardItems: MoodboardItem[],
    technicalFiles: TechnicalFile[],
    workspaceId: string
  ) {
    const updates: any = {
      name: projectData.name,
      description: projectData.description || null,
      client_id: projectData.client_id || null,
      status: projectData.status,
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      progress: projectData.progress,
      type: projectData.type || null,
      location: projectData.location || null,
      briefing: projectData.briefing || {},
      moodboard: moodboardItems as any,
      technical_files: technicalFiles as any,
    };

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (data?.id) {
      await checkAndNotifyExpiringProjectsAndTasks({ projectId: data.id });
    }

    return { data, error };
  },
};
