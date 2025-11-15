import { supabase } from "@/integrations/supabase/client";

type WorkspaceScopedTable = 
  | "projects" 
  | "clients" 
  | "tasks" 
  | "project_areas" 
  | "project_activities";

/**
 * Helper de segurança para criar queries com isolamento de workspace garantido.
 * 
 * ❌ NUNCA USAR: supabase.from("projects").select("*")
 * ✅ SEMPRE USAR: createWorkspaceQuery("projects", workspaceId)
 * 
 * @throws Error se workspaceId for undefined/null - previne vazamento de dados
 */
export function createWorkspaceQuery<T = any>(
  table: WorkspaceScopedTable,
  workspaceId: string | undefined
) {
  if (!workspaceId) {
    throw new Error(
      `❌ SECURITY ERROR: Tentativa de query em "${table}" sem workspace_id. ` +
      `Isso viola o isolamento multi-tenant! ` +
      `Todas as queries devem estar vinculadas a um workspace específico.`
    );
  }

  // SEMPRE adiciona o filtro de workspace - não há como escapar disso
  return supabase
    .from(table)
    .select("*")
    .eq("workspace_id", workspaceId);
}
