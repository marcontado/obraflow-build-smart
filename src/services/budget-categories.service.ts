import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BudgetCategory = Database["public"]["Tables"]["budget_categories"]["Row"];
type BudgetCategoryInsert = Database["public"]["Tables"]["budget_categories"]["Insert"];
type BudgetCategoryUpdate = Database["public"]["Tables"]["budget_categories"]["Update"];

export const budgetCategoriesService = {
  async getByWorkspace(workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return { data, error };
  },

  async create(category: BudgetCategoryInsert) {
    const { data, error } = await supabase
      .from("budget_categories")
      .insert(category)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: BudgetCategoryUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("budget_categories")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    
    return { error };
  },

  async seedDefaultCategories(workspaceId: string) {
    const defaultCategories: BudgetCategoryInsert[] = [
      { workspace_id: workspaceId, name: "Revestimentos", color: "#ef4444", icon: "Layers", sort_order: 1 },
      { workspace_id: workspaceId, name: "Iluminação", color: "#f59e0b", icon: "Lightbulb", sort_order: 2 },
      { workspace_id: workspaceId, name: "Marmoaria", color: "#8b5cf6", icon: "Square", sort_order: 3 },
      { workspace_id: workspaceId, name: "Marcenaria", color: "#84cc16", icon: "Hammer", sort_order: 4 },
      { workspace_id: workspaceId, name: "Materiais e Equipamentos", color: "#06b6d4", icon: "Package", sort_order: 5 },
      { workspace_id: workspaceId, name: "Instalações Hidráulicas", color: "#3b82f6", icon: "Droplet", sort_order: 6 },
      { workspace_id: workspaceId, name: "Instalações Elétricas", color: "#eab308", icon: "Zap", sort_order: 7 },
      { workspace_id: workspaceId, name: "Pintura", color: "#ec4899", icon: "Paintbrush", sort_order: 8 },
      { workspace_id: workspaceId, name: "Acabamentos", color: "#14b8a6", icon: "Sparkles", sort_order: 9 },
      { workspace_id: workspaceId, name: "Mobiliário", color: "#a855f7", icon: "Armchair", sort_order: 10 },
      { workspace_id: workspaceId, name: "Paisagismo", color: "#22c55e", icon: "Trees", sort_order: 11 },
      { workspace_id: workspaceId, name: "Geral/Outros", color: "#64748b", icon: "MoreHorizontal", sort_order: 12 },
    ];

    const { data, error } = await supabase
      .from("budget_categories")
      .insert(defaultCategories)
      .select();

    return { data, error };
  },
};
