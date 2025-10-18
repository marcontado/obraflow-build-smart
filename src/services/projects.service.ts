import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export const projectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(name), project_areas(*)")
      .eq("id", id)
      .single();

    return { data, error };
  },

  async create(project: ProjectInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...project, created_by: user?.id })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    return { error };
  },

  async getStats() {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("status, budget, spent");

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
};
