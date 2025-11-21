import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workspacesService } from "@/services/workspaces.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const workspaceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function WorkspaceNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshWorkspaces, canCreateWorkspace } = useWorkspace();
  const { canCreateWorkspace: hasRolePermission } = useUserRole();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!hasRolePermission) {
      toast({
        title: "Permissão negada",
        description: "Apenas owners e admins podem criar novos workspaces.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [hasRolePermission, navigate, toast]);

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!canCreateWorkspace() || !hasRolePermission) {
      toast({
        title: hasRolePermission ? "Limite atingido" : "Permissão negada",
        description: hasRolePermission 
          ? "Você atingiu o limite de workspaces do seu plano atual."
          : "Apenas owners e admins podem criar novos workspaces.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { data: workspace, error } = await workspacesService.create(data.name);

    if (error) {
      toast({
        title: "Erro ao criar workspace",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Workspace criado!",
      description: "Seu workspace foi criado com sucesso.",
    });

    await refreshWorkspaces();
    
    // Redirect to workspace settings
    if (workspace) {
      navigate(`/workspace/${workspace.id}/settings`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Criar Novo Workspace</CardTitle>
              <CardDescription>
                Configure seu workspace para começar a gerenciar projetos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Workspace</FormLabel>
                    <FormControl>
                      <Input placeholder="Meu Escritório" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Criando..." : "Criar Workspace"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
