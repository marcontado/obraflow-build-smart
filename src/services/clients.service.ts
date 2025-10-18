import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export const clientsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });

    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*, projects(*)")
      .eq("id", id)
      .single();

    return { data, error };
  },

  async create(client: ClientInsert, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("clients")
      .insert({ ...client, created_by: user?.id, workspace_id: workspaceId })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: ClientUpdate) {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    return { error };
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("name", { ascending: true });

    return { data, error };
  },
};
