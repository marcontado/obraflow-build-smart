import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const workspaceSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
  slug: z.string().min(3, "Slug deve ter no mínimo 3 caracteres").max(50).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface WorkspaceGeneralSettingsProps {
  workspaceId: string;
}

export function WorkspaceGeneralSettings({ workspaceId }: WorkspaceGeneralSettingsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const [deleting, setDeleting] = useState(false);

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: currentWorkspace?.name || "",
      slug: currentWorkspace?.slug || "",
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    const { error } = await workspacesService.update(workspaceId, data);

    if (error) {
      toast({
        title: "Erro ao atualizar workspace",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workspace atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });

    refreshWorkspaces();
  };

  const handleDelete = async () => {
    setDeleting(true);

    const { error } = await workspacesService.delete(workspaceId);

    if (error) {
      toast({
        title: "Erro ao deletar workspace",
        description: error.message,
        variant: "destructive",
      });
      setDeleting(false);
      return;
    }

    toast({
      title: "Workspace deletado",
      description: "O workspace foi removido com sucesso.",
    });

    navigate("/workspace/select");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>
            Atualize o nome e slug do workspace
          </CardDescription>
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
                      <Input placeholder="Minha Empresa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome que aparecerá no seletor de workspaces
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="minha-empresa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único (apenas letras minúsculas, números e hífens)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Salvar Alterações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis relacionadas ao workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Deletar Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso vai deletar permanentemente o workspace,
                  todos os projetos, tarefas, clientes e dados associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deletando..." : "Sim, deletar workspace"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
