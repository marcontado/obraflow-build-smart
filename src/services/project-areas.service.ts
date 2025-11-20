import { supabase } from "./supabase.server";
import type { Database } from "@/integrations/supabase/types";

type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];
type ProjectAreaInsert = Database["public"]["Tables"]["project_areas"]["Insert"];
type ProjectAreaUpdate = Database["public"]["Tables"]["project_areas"]["Update"];

export const projectAreasService = {
  async getByProject(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_areas")
      .select("*")
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async create(area: ProjectAreaInsert, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_areas")
      .insert({ ...area, workspace_id: workspaceId })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: ProjectAreaUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_areas")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("project_areas")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    return { error };
  },
};
