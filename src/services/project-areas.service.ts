import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];
type ProjectAreaInsert = Database["public"]["Tables"]["project_areas"]["Insert"];
type ProjectAreaUpdate = Database["public"]["Tables"]["project_areas"]["Update"];

const API_BASE = "https://archestra-backend.onrender.com";

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
    // Supabase
    const { data, error } = await supabase
      .from("project_areas")
      .insert({ ...area, workspace_id: workspaceId })
      .select()
      .single();

    // DynamoDB (API Python)
    try {
      await fetch(`${API_BASE}/project_areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data?.id ?? area.id,
          name: area.name,
          description: area.description ?? "",
          budget: area.budget ?? 0,
          project_id: area.project_id,
          workspace_id: workspaceId,
        }),
      });
    } catch (e) {
    }

    return { data, error };
  },

  async update(id: string, updates: ProjectAreaUpdate, workspaceId: string) {
    // Supabase
    const { data, error } = await supabase
      .from("project_areas")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    // DynamoDB (API Python)
    try {
      await fetch(`${API_BASE}/project_areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: updates.name ?? data?.name ?? "",
          description: updates.description ?? data?.description ?? "",
          budget: typeof updates.budget === "number" ? updates.budget : data?.budget ?? 0,
          project_id: updates.project_id ?? data?.project_id ?? "",
          workspace_id: workspaceId,
        }),
      });
    } catch (e) {
      // Trate erro se necessário
    }

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    // Supabase
    const { error } = await supabase
      .from("project_areas")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    // DynamoDB (API Python)
    try {
      await fetch(`${API_BASE}/project_areas/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      // Trate erro se necessário
    }

    return { error };
  },
};
