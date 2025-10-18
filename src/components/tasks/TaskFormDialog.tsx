import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { taskSchema, type TaskFormData } from "@/schemas/task.schema";
import { tasksService } from "@/services/tasks.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  taskId?: string;
  initialData?: any;
  initialStatus?: string;
}

const statusLabels = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Em Revisão",
  done: "Concluído",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export function TaskFormDialog({
  open,
  onClose,
  onSuccess,
  projectId,
  taskId,
  initialData,
  initialStatus = "todo",
}: TaskFormDialogProps) {
  const { currentWorkspace } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [projectDates, setProjectDates] = useState<{ start_date?: string; end_date?: string }>({});

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: initialStatus as any,
      priority: "medium",
      due_date: "",
      area_id: "",
      assigned_to: "",
      project_start_date: "",
      project_end_date: "",
    },
  });

  useEffect(() => {
    if (open && projectId) {
      fetchAreas();
      fetchProjectDates();
    }
  }, [open, projectId]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "todo",
        priority: initialData.priority || "medium",
        due_date: initialData.due_date || "",
        area_id: initialData.area_id || "",
        assigned_to: initialData.assigned_to || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: initialStatus as any,
        priority: "medium",
        due_date: "",
        area_id: "",
        assigned_to: "",
        project_start_date: projectDates.start_date || "",
        project_end_date: projectDates.end_date || "",
      });
    }
  }, [initialData, open, initialStatus]);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from("project_areas")
      .select("*")
      .eq("project_id", projectId);
    
    setAreas(data || []);
  };

  const fetchProjectDates = async () => {
    const { data } = await supabase
      .from("projects")
      .select("start_date, end_date")
      .eq("id", projectId)
      .single();
    
    if (data) {
      setProjectDates({
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      });
      
      // Atualizar o form com as datas do projeto
      form.setValue("project_start_date", data.start_date || "");
      form.setValue("project_end_date", data.end_date || "");
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!currentWorkspace) {
      toast.error("Nenhum workspace selecionado");
      return;
    }

    try {
      setSubmitting(true);

      // Obter user_id diretamente aqui para evitar race condition
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        toast.error("Usuário não autenticado. Por favor, faça login novamente.");
        return;
      }

      const taskData: any = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        project_id: projectId,
        created_by: user.id,
        area_id: data.area_id || null,
        assigned_to: data.assigned_to || null,
        due_date: data.due_date || null,
      };

      if (taskId) {
        const { error } = await tasksService.update(taskId, taskData);
        if (error) throw error;
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        const { error } = await tasksService.create(taskData, currentWorkspace.id);
        if (error) throw error;
        toast.success("Tarefa criada com sucesso!");
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar tarefa");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{taskId ? "Editar" : "Nova"} Tarefa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Comprar materiais" {...field} />
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
                      placeholder="Detalhes da tarefa..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área do Projeto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhuma área selecionada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : taskId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
