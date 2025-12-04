import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Upload, ImageIcon } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentWorkspace?.logo_url || "");

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: currentWorkspace?.name || "",
      slug: currentWorkspace?.slug || "",
    },
  });

  useEffect(() => {
    async function fetchLogo() {
      if (!workspaceId) return;
      try {
        const response = await fetch(`https://archestra-backend.onrender.com/workspaces/${workspaceId}`);
        const data = await response.json();
        setLogoUrl(data.logo_url || "");
      } catch {
        setLogoUrl("");
      }
    }
    fetchLogo();
  }, [workspaceId]);

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

    await fetch(`https://archestra-backend.onrender.com/workspaces/${workspaceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: workspaceId,
        name: data.name,
        slug: data.slug,
        owner_id: currentWorkspace?.created_by || "",
        updated_at: new Date().toISOString(),
        logo_url: logoUrl,
      }),
    });

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

    await fetch(`https://archestra-backend.onrender.com/workspaces/${workspaceId}`, {
      method: "DELETE",
    });

    toast({
      title: "Workspace deletado",
      description: "O workspace foi removido com sucesso.",
    });

    navigate("/workspace/select");
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const contentType = file.type;
      const presignRes = await fetch(
        `https://archestra-backend.onrender.com/upload/logo?user_id=${currentWorkspace?.created_by}&content_type=${contentType}`
      );
      const { upload_url, object_url } = await presignRes.json();

      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });

      await fetch(`https://archestra-backend.onrender.com/users/${currentWorkspace?.created_by}/logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: object_url }),
      });

      await fetch(`https://archestra-backend.onrender.com/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workspaceId,
          name: currentWorkspace?.name,
          slug: currentWorkspace?.slug,
          owner_id: currentWorkspace?.created_by || "",
          updated_at: new Date().toISOString(),
          logo_url: object_url,
        }),
      });

      setLogoUrl(object_url);
      toast({
        title: "Logo atualizado!",
        description: "O logo do workspace foi atualizado com sucesso. Recarregue a página para visualizar a mudança.",
      });

      refreshWorkspaces();
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao fazer upload do logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo do Workspace</CardTitle>
          <CardDescription>
            Adicione um logo para identificar seu workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt="Logo do workspace" />
              ) : (
                <AvatarFallback>
                  <ImageIcon className="h-10 w-10" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("logo-upload")?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Enviando..." : "Fazer Upload"}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG ou WebP. Máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
