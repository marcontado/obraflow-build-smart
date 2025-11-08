import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Slider } from "@/components/ui/slider";
import { projectActivitiesService } from "@/services/project-activities.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

const activitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de término é obrigatória"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  progress: z.number().min(0).max(100),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: "Data de término deve ser posterior à data de início",
  path: ["end_date"],
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  activityId?: string;
  initialData?: any;
}

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export function ActivityFormDialog({
  open,
  onClose,
  onSuccess,
  projectId,
  activityId,
  initialData,
}: ActivityFormDialogProps) {
  console.log("🟢 ActivityFormDialog render - open:", open, "activityId:", activityId);
  const { currentWorkspace } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      priority: "medium",
      progress: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        priority: initialData.priority || "medium",
        progress: initialData.progress || 0,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        priority: "medium",
        progress: 0,
      });
    }
  }, [initialData, open]);

  const onSubmit = async (data: ActivityFormData) => {
    console.log("🟡 Form submit started", { activityId, data, currentWorkspace });
    
    if (!currentWorkspace) {
      toast.error("Nenhum workspace selecionado");
      return;
    }

    try {
      setSubmitting(true);

      const activityData: any = {
        name: data.name,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date,
        priority: data.priority,
        progress: data.progress,
        project_id: projectId,
      };

      if (activityId) {
        const { error } = await projectActivitiesService.update(activityId, activityData, currentWorkspace.id);
        if (error) throw error;
        toast.success("Atividade atualizada com sucesso!");
      } else {
        const { error } = await projectActivitiesService.create(activityData, currentWorkspace.id);
        if (error) throw error;
        toast.success("Atividade criada com sucesso!");
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("🔴 Error saving activity:", error);
      const errorMessage = error?.message || "Erro desconhecido";
      toast.error(`Erro ao salvar atividade: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log("🟣 Dialog onOpenChange:", isOpen);
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activityId ? "Editar" : "Nova"} Atividade</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Atividade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvimento do Projeto" {...field} />
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
                      placeholder="Detalhes da atividade..."
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progresso: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : activityId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
