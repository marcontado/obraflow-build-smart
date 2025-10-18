import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSelect() {
  const navigate = useNavigate();
  const { workspaces, loading, switchWorkspace, canCreateWorkspace } = useWorkspace();

  useEffect(() => {
    // Se só tem um workspace, selecionar automaticamente
    if (!loading && workspaces.length === 1) {
      switchWorkspace(workspaces[0].id).then(() => navigate("/"));
    }
  }, [loading, workspaces]);

  const handleSelectWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-2xl space-y-4 p-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Selecione um Workspace</h1>
          <p className="mt-2 text-muted-foreground">
            Escolha o workspace que deseja acessar
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => handleSelectWorkspace(workspace.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Plano: {workspace.subscription_plan}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {canCreateWorkspace() && (
            <Card
              className="cursor-pointer border-dashed transition-colors hover:border-primary"
              onClick={() => navigate("/workspace/new")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Criar Workspace</CardTitle>
                    <CardDescription className="text-sm">
                      Adicionar novo workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center">
            <Button onClick={() => navigate("/workspace/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
