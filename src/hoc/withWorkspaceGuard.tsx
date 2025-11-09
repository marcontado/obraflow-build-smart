import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "@/hooks/use-toast";

/**
 * Higher-Order Component (HOC) que garante que o componente só será renderizado
 * se existir um workspace ativo.
 * 
 * Se não houver workspace, redireciona para a seleção de workspace.
 * 
 * Uso:
 * ```typescript
 * export default withWorkspaceGuard(Reports);
 * ```
 */
export function withWorkspaceGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuardedComponent(props: P) {
    const { currentWorkspace, loading } = useWorkspace();
    const navigate = useNavigate();

    useEffect(() => {
      // Aguardar carregamento antes de validar
      if (loading) return;

      if (!currentWorkspace) {
        toast({
          title: "Workspace necessário",
          description: "Selecione um workspace para continuar",
          variant: "destructive",
        });
        navigate("/workspace/select");
      }
    }, [currentWorkspace, loading, navigate]);

    // Mostrar loading enquanto carrega workspaces
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando workspace...</p>
          </div>
        </div>
      );
    }

    // Mostrar placeholder enquanto redireciona
    if (!currentWorkspace) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum workspace selecionado</h2>
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
