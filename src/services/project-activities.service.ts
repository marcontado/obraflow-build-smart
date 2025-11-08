import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Activity = Database["public"]["Tables"]["project_activities"]["Row"];
type ActivityInsert = Database["public"]["Tables"]["project_activities"]["Insert"];
type ActivityUpdate = Database["public"]["Tables"]["project_activities"]["Update"];

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
    
    const { data, error } = await supabase
      .from("project_activities")
      .insert({ 
        ...activity, 
        created_by: user?.id, 
        workspace_id: workspaceId 
      })
      .select()
      .single();

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
