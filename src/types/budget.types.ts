import type { Database } from "@/integrations/supabase/types";

export type BudgetCategory = Database["public"]["Tables"]["budget_categories"]["Row"];
export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];

export interface BudgetItemWithRelations extends BudgetItem {
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
}

export const measurementUnits = [
  { value: "m²", label: "m² (Metro quadrado)" },
  { value: "m", label: "m (Metro linear)" },
  { value: "un", label: "un (Unidade)" },
  { value: "kg", label: "kg (Quilograma)" },
  { value: "l", label: "l (Litro)" },
  { value: "cx", label: "cx (Caixa)" },
] as const;

export const budgetItemStatus = [
  { value: "pendente", label: "Pendente", color: "bg-muted" },
  { value: "cotado", label: "Cotado", color: "bg-blue-500" },
  { value: "comprado", label: "Comprado", color: "bg-green-500" },
  { value: "aplicado", label: "Aplicado", color: "bg-purple-500" },
] as const;
