import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./GanttChartStyles.css";
import { format, addDays, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { tasksService } from "@/services/tasks.service";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface InteractiveGanttChartProps {
  tasks: Task[];
  projectId: string;
  projectStartDate?: string;
  projectEndDate?: string;
  onTasksChange?: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: "#DC2626", // red-600
  high: "#EA580C", // orange-600
  medium: "#CA8A04", // yellow-600
  low: "#16A34A", // green-600
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
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Day)}
                  className={viewMode === ViewMode.Day ? "bg-primary/10 border-primary" : ""}
                >
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Dia
                </Button>
              </TooltipTrigger>
              <TooltipContent>Visualização detalhada por dia</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Week)}
                  className={viewMode === ViewMode.Week ? "bg-primary/10 border-primary" : ""}
                >
                  Semana
                </Button>
              </TooltipTrigger>
              <TooltipContent>Visualização semanal</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Month)}
                  className={viewMode === ViewMode.Month ? "bg-primary/10 border-primary" : ""}
                >
                  <ZoomOut className="h-4 w-4 mr-1" />
                  Mês
                </Button>
              </TooltipTrigger>
              <TooltipContent>Visualização mensal</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAddTask} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen} className="shadow-sm">
            {isFullScreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Sair
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Visualização Completa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="flex items-center gap-6 flex-wrap p-3 bg-muted/30 rounded-lg border">
        <span className="font-semibold text-sm">Legenda de Prioridade:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: priorityColors.urgent }} />
            <span className="text-sm">Urgente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: priorityColors.high }} />
            <span className="text-sm">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: priorityColors.medium }} />
            <span className="text-sm">Média</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: priorityColors.low }} />
            <span className="text-sm">Baixa</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart with Enhanced Styling */}
      <div className="gantt-container bg-background border rounded-lg overflow-auto shadow-sm" style={{ height: isFullScreen ? "calc(100vh - 200px)" : "600px" }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onDelete={handleTaskDelete}
          onClick={handleTaskClick}
          locale="pt-BR"
          listCellWidth={isFullScreen ? "220px" : "180px"}
          columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 60}
          ganttHeight={Math.max(ganttTasks.length * 56 + 120, 400)}
          barCornerRadius={24}
          todayColor="rgba(59, 130, 246, 0.08)"
          barProgressColor="rgba(255, 255, 255, 0.3)"
          barProgressSelectedColor="rgba(255, 255, 255, 0.4)"
          TooltipContent={({ task }) => {
            const taskData = tasks.find(t => t.id === task.id);
            if (!taskData) return <div />;
            
            return (
              <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs">
                <div className="font-semibold text-sm mb-2">{task.name}</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Início:</span>
                    <span className="font-medium">{format(task.start, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Fim:</span>
                    <span className="font-medium">{format(task.end, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between gap-4 items-center">
                    <span className="text-muted-foreground">Prioridade:</span>
                    <Badge 
                      variant={taskData.priority === 'urgent' ? 'destructive' : 'secondary'} 
                      className="text-xs capitalize"
                    >
                      {taskData.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between gap-4 items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {statusLabels[taskData.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Enhanced Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = tasks.filter((t) => t.status === status).length;
          return (
            <Card key={status} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center space-y-1">
                  <p className="text-3xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {count === 1 ? 'tarefa' : 'tarefas'}
                  </p>
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
