import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createWorkspaceQuery } from "@/lib/workspace-query";

type WorkspaceScopedTable = 
  | "projects" 
  | "clients" 
  | "tasks" 
  | "project_areas" 
  | "project_activities"
  | "partners"
  | "document_templates"
  | "generated_documents";

/**
 * Hook para queries automaticamente vinculadas ao workspace atual.
 * 
 * Uso:
 * ```typescript
 * const { query, workspaceId } = useWorkspaceQuery();
 * 
 * // Automaticamente scoped ao workspace
 * const { data } = await query("projects")
 *   .eq("status", "active")
 *   .order("created_at");
 * ```
 * 
 * @throws Error se usado fora de WorkspaceProvider ou sem workspace ativo
 */
export function useWorkspaceQuery() {
  const { currentWorkspace } = useWorkspace();
  
  if (!currentWorkspace) {
    throw new Error(
      "useWorkspaceQuery usado sem workspace ativo. " +
      "Certifique-se de que o componente está protegido com withWorkspaceGuard."
    );
  }

  return {
    workspaceId: currentWorkspace.id,
    query: <T = any>(table: WorkspaceScopedTable) => 
      createWorkspaceQuery<T>(table, currentWorkspace.id)
  };
}
