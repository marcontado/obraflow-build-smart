import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { format, addDays, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Maximize2, ZoomIn, ZoomOut, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { tasksService } from "@/services/tasks.service";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface InteractiveGanttChartProps {
  tasks: Task[];
  projectId: string;
  projectStartDate?: string;
  projectEndDate?: string;
  onTasksChange?: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const statusLabels: Record<string, string> = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Revisão",
  done: "Concluído",
};

export function InteractiveGanttChart({
  tasks,
  projectId,
  projectStartDate,
  projectEndDate,
  onTasksChange,
}: InteractiveGanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const ganttTasks: GanttTask[] = useMemo(() => {
    const tasksWithDates = tasks.filter((task) => task.due_date);

    return tasksWithDates.map((task) => {
      // Use due_date as end, and calculate start as 1 day before for visualization
      const endDate = new Date(task.due_date!);
      const startDate = addDays(endDate, -1);

      return {
        id: task.id,
        name: task.title,
        start: startOfDay(startDate),
        end: startOfDay(endDate),
        progress: task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0,
        type: "task" as const,
        styles: {
          backgroundColor: priorityColors[task.priority || "medium"],
          backgroundSelectedColor: priorityColors[task.priority || "medium"],
          progressColor: priorityColors[task.priority || "medium"],
          progressSelectedColor: priorityColors[task.priority || "medium"],
        },
        project: task.area_id || undefined,
      };
    });
  }, [tasks]);

  const handleTaskChange = useCallback(
    async (task: GanttTask) => {
      try {
        const originalTask = tasks.find((t) => t.id === task.id);
        if (!originalTask) return;

        // Calculate new due_date from the end date
        const newDueDate = format(task.end, "yyyy-MM-dd");

        await tasksService.update(task.id, {
          due_date: newDueDate,
        });

        toast.success("Tarefa atualizada com sucesso!");

        onTasksChange?.();
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Erro ao atualizar tarefa");
      }
    },
    [tasks, onTasksChange]
  );

  const handleTaskDelete = useCallback(
    (task: GanttTask) => {
      const originalTask = tasks.find((t) => t.id === task.id);
      if (originalTask) {
        setTaskToDelete(originalTask);
        setDeleteDialogOpen(true);
      }
    },
    [tasks]
  );

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    const { error } = await tasksService.delete(taskToDelete.id);

    if (error) {
      toast.error(error.message || "Erro ao excluir tarefa");
    } else {
      toast.success("Tarefa excluída com sucesso!");
      onTasksChange?.();
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleTaskClick = useCallback(
    (task: GanttTask) => {
      const originalTask = tasks.find((t) => t.id === task.id);
      if (originalTask) {
        setSelectedTask(originalTask);
        setFormOpen(true);
      }
    },
    [tasks]
  );

  const handleAddTask = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTask(null);
  };

  const handleFormSuccess = () => {
    onTasksChange?.();
    handleFormClose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (ganttTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronograma (Gantt)</CardTitle>
          <CardDescription>Visualize e gerencie as tarefas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-center text-muted-foreground">
              Nenhuma tarefa com data de vencimento cadastrada
            </p>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Day)}
            className={viewMode === ViewMode.Day ? "bg-accent" : ""}
          >
            Dia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Week)}
            className={viewMode === ViewMode.Week ? "bg-accent" : ""}
          >
            Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Month)}
            className={viewMode === ViewMode.Month ? "bg-accent" : ""}
          >
            Mês
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullScreen ? "Sair do Modo Completo" : "Visualização Completa"}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <span className="text-muted-foreground">Prioridade:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColors.urgent }} />
          <span>Urgente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColors.high }} />
          <span>Alta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColors.medium }} />
          <span>Média</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColors.low }} />
          <span>Baixa</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-container bg-background border rounded-lg overflow-auto" style={{ height: isFullScreen ? "calc(100vh - 200px)" : "600px" }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onDelete={handleTaskDelete}
          onClick={handleTaskClick}
          locale="pt-BR"
          listCellWidth={isFullScreen ? "200px" : "155px"}
          columnWidth={viewMode === ViewMode.Month ? 65 : viewMode === ViewMode.Week ? 250 : 60}
          todayColor="rgba(139, 92, 246, 0.1)"
          barBackgroundColor="#cbd5e1"
          barBackgroundSelectedColor="#94a3b8"
        />
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = tasks.filter((t) => t.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {isFullScreen ? (
        <div className="fixed inset-0 z-50 bg-background p-6 overflow-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Cronograma do Projeto</h2>
            <p className="text-sm text-muted-foreground">
              {projectStartDate && projectEndDate
                ? `${format(new Date(projectStartDate), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(projectEndDate), "dd/MM/yyyy", { locale: ptBR })}`
                : "Visualização completa do cronograma"}
            </p>
          </div>
          {content}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma (Gantt)</CardTitle>
            <CardDescription>
              {projectStartDate && projectEndDate
                ? `${format(new Date(projectStartDate), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(projectEndDate), "dd/MM/yyyy", { locale: ptBR })}`
                : "Visualize e gerencie as tarefas do projeto ao longo do tempo"}
            </CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      )}

      <TaskFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        taskId={selectedTask?.id}
        initialData={selectedTask || undefined}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        isLoading={isDeleting}
      />
    </>
  );
}
