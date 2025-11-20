import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Partner = Database["public"]["Tables"]["partners"]["Row"];
type PartnerInsert = Database["public"]["Tables"]["partners"]["Insert"];
type PartnerUpdate = Database["public"]["Tables"]["partners"]["Update"];

export const partnersService = {
  async getAll(workspaceId: string) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });

    return { data, error };
  },

  async getById(id: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    return { data, error };
  },

  async create(partner: Omit<PartnerInsert, "workspace_id" | "created_by">, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("partners")
      .insert({ 
        ...partner, 
        created_by: user?.id, 
        workspace_id: workspaceId 
      })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: PartnerUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("partners")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("partners")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
      
    return { error };
  },

  async search(query: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("workspace_id", workspaceId)
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .order("name", { ascending: true });

    return { data, error };
  },

  async filterByCategory(category: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("category", category)
      .order("name", { ascending: true });

    return { data, error };
  }
};
