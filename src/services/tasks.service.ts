import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export const tasksService = {
  async getByProject(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project_areas(name), profiles!tasks_assigned_to_fkey(full_name)")
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getById(id: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project_areas(name), profiles!tasks_assigned_to_fkey(full_name)")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();

    return { data, error };
  },

  async create(task: TaskInsert, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...task, created_by: user?.id, workspace_id: workspaceId })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: TaskUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async updateStatus(id: string, status: string, workspaceId: string) {
    const updates: TaskUpdate = { 
      status: status as any,
      completed_at: status === "done" ? new Date().toISOString() : null
    };
    
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    return { error };
  },
};
