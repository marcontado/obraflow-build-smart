import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Activity = Database["public"]["Tables"]["project_activities"]["Row"];
type ActivityInsert = Database["public"]["Tables"]["project_activities"]["Insert"];
type ActivityUpdate = Database["public"]["Tables"]["project_activities"]["Update"];

const BASE_URL = "https://archestra-backend.onrender.com";

export const projectActivitiesService = {
  async getByProject(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_activities")
      .select("*")
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("start_date", { ascending: true });

    return { data, error };
  },

  async getById(id: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_activities")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();

    return { data, error };
  },

  async create(activity: ActivityInsert, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    // Gera um id se não existir
    const id = activity.id || crypto.randomUUID();

    const fullActivity = {
      ...activity,
      id,
      created_by: user?.id,
      workspace_id: workspaceId,
    };

    // Cadastro no Supabase
    const { data, error } = await supabase
      .from("project_activities")
      .insert(fullActivity)
      .select()
      .single();

    // Cadastro no DynamoDB via backend
    try {
      const response = await fetch(`${BASE_URL}/project_activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: fullActivity.id,
          name: fullActivity.name,
          description: fullActivity.description ?? "", 
          start_date: fullActivity.start_date,
          end_date: fullActivity.end_date,
          progress: fullActivity.progress,
          priority: fullActivity.priority,
          project_id: fullActivity.project_id,
          workspace_id: fullActivity.workspace_id,
          created_by: fullActivity.created_by ?? "", 
        }),
      });
      const result = await response.json();
      console.log("DynamoDB activity create:", result);
    } catch (err) {
      console.error("Erro ao cadastrar atividade no DynamoDB:", err);
    }

    return { data, error };
  },

  async update(id: string, updates: ActivityUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_activities")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("project_activities")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
      
    return { error };
  },

  async bulkUpdate(updates: { id: string; data: ActivityUpdate }[], workspaceId: string) {
    const promises = updates.map(({ id, data }) => 
      supabase
        .from("project_activities")
        .update(data)
        .eq("id", id)
        .eq("workspace_id", workspaceId)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error).map(r => r.error);
    
    return { 
      success: errors.length === 0, 
      errors: errors.length > 0 ? errors : null 
    };
  }
};
