import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];
type BudgetItemInsert = Database["public"]["Tables"]["budget_items"]["Insert"];
type BudgetItemUpdate = Database["public"]["Tables"]["budget_items"]["Update"];

export const budgetItemsService = {
  async getByProject(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_items")
      .select(`
        *,
        category:budget_categories(id, name, color, icon),
        area:project_areas(id, name)
      `)
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getByCategory(categoryId: string, projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_items")
      .select(`
        *,
        area:project_areas(id, name)
      `)
      .eq("category_id", categoryId)
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async create(item: BudgetItemInsert) {
    const { data, error } = await supabase
      .from("budget_items")
      .insert(item)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: BudgetItemUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_items")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("budget_items")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    
    return { error };
  },

  async getTotalsByCategory(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_items")
      .select("category_id, total_price, status")
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId);

    if (error) return { data: null, error };

    // Agregar por categoria
    const totals = data.reduce((acc: Record<string, { total: number; spent: number }>, item) => {
      if (!acc[item.category_id]) {
        acc[item.category_id] = { total: 0, spent: 0 };
      }
      
      const price = item.total_price || 0;
      acc[item.category_id].total += price;
      
      if (item.status === 'comprado' || item.status === 'aplicado') {
        acc[item.category_id].spent += price;
      }
      
      return acc;
    }, {});

    return { data: totals, error: null };
  },
};
