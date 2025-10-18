import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectAreaSchema, type ProjectAreaFormData } from "@/schemas/project-area.schema";
import { projectAreasService } from "@/services/project-areas.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];

interface ProjectAreaFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  areaId?: string;
  initialData?: Partial<ProjectArea>;
}

export function ProjectAreaFormDialog({
  open,
  onClose,
  onSuccess,
  projectId,
  areaId,
  initialData,
}: ProjectAreaFormDialogProps) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const form = useForm<ProjectAreaFormData>({
    resolver: zodResolver(projectAreaSchema),
    defaultValues: {
      name: "",
      description: "",
      budget: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        budget: initialData.budget?.toString() || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        budget: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProjectAreaFormData) => {
    if (!currentWorkspace) {
      toast({
        title: "Erro",
        description: "Nenhum workspace selecionado",
        variant: "destructive",
      });
      return;
    }

    const areaData = {
      name: data.name,
      description: data.description || null,
      budget: data.budget ? Number(data.budget) : null,
      project_id: projectId,
      workspace_id: currentWorkspace.id,
    };

    const { error } = areaId
      ? await projectAreasService.update(areaId, areaData)
      : await projectAreasService.create(areaData, currentWorkspace.id);

    if (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${areaId ? "atualizar" : "criar"} área`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Área ${areaId ? "atualizada" : "criada"} com sucesso`,
    });

    form.reset();
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{areaId ? "Editar Área" : "Nova Área"}</DialogTitle>
          <DialogDescription>
            {areaId ? "Edite as informações da área" : "Crie uma nova área para o projeto"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Área *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sala de Estar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes desta área..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {areaId ? "Salvar" : "Criar Área"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
