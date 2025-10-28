import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import styles from "./GanttShell.module.css";
import { format, addDays, startOfDay, differenceInDays, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { projectActivitiesService } from "@/services/project-activities.service";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type Activity = Database["public"]["Tables"]["project_activities"]["Row"];

interface ProjectScheduleProps {
  projectId: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

const priorityColors: Record<string, string> = {
  urgent: "#DC2626",
  high: "#EA580C",
  medium: "#CA8A04",
  low: "#6B7D4F",
};

export function ProjectSchedule({
  projectId,
  projectStartDate,
  projectEndDate,
}: ProjectScheduleProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await projectActivitiesService.getByProject(projectId);
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Erro ao carregar atividades do cronograma");
    } finally {
      setLoading(false);
    }
  };

  const dateRange = useMemo(() => {
    let minDate: Date;
    let maxDate: Date;

    if (projectStartDate && projectEndDate) {
      minDate = new Date(projectStartDate);
      maxDate = new Date(projectEndDate);
    } else if (activities.length > 0) {
      const dates = activities.flatMap(a => [new Date(a.start_date), new Date(a.end_date)]);
      minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    } else {
      const today = new Date();
      minDate = addMonths(today, -6);
      maxDate = addMonths(today, 6);
    }

    return {
      start: addMonths(minDate, -3),
      end: addMonths(maxDate, 3)
    };
  }, [activities, projectStartDate, projectEndDate]);

  const ganttTasks: GanttTask[] = useMemo(() => {
    return activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      start: startOfDay(new Date(activity.start_date)),
      end: startOfDay(new Date(activity.end_date)),
      progress: activity.progress || 0,
      type: "task" as const,
      styles: {
        backgroundColor: priorityColors[activity.priority || "medium"],
        backgroundSelectedColor: priorityColors[activity.priority || "medium"],
        progressColor: "rgba(255, 255, 255, 0.4)",
        progressSelectedColor: "rgba(255, 255, 255, 0.6)",
      },
    }));
  }, [activities]);

  const handleTaskChange = useCallback(
    async (task: GanttTask) => {
      try {
        const newStartDate = format(task.start, "yyyy-MM-dd");
        const newEndDate = format(task.end, "yyyy-MM-dd");

        await projectActivitiesService.update(task.id, {
          start_date: newStartDate,
          end_date: newEndDate,
        });

        toast.success("Atividade atualizada!");
        fetchActivities();
      } catch (error) {
        console.error("Error updating activity:", error);
        toast.error("Erro ao atualizar atividade");
      }
    },
    []
  );

  const handleTaskClick = useCallback(
    (task: GanttTask) => {
      const activity = activities.find((a) => a.id === task.id);
      if (activity) {
        setSelectedActivity(activity);
        setFormOpen(true);
      }
    },
    [activities]
  );

  const handleTaskDelete = useCallback(
    (task: GanttTask) => {
      const activity = activities.find((a) => a.id === task.id);
      if (activity) {
        setActivityToDelete(activity);
        setDeleteDialogOpen(true);
      }
    },
    [activities]
  );

  const confirmDelete = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    const { error } = await projectActivitiesService.delete(activityToDelete.id);

    if (error) {
      toast.error("Erro ao excluir atividade");
    } else {
      toast.success("Atividade excluída com sucesso!");
      fetchActivities();
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleAddActivity = () => {
    console.log("🔵 handleAddActivity called");
    console.log("🔵 currentWorkspace:", currentWorkspace);
    
    if (!currentWorkspace) {
      toast.error("Nenhum workspace selecionado. Por favor, selecione um workspace.");
      return;
    }
    
    setSelectedActivity(null);
    setFormOpen(true);
    console.log("🔵 formOpen set to true");
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedActivity(null);
  };

  const handleFormSuccess = () => {
    fetchActivities();
    handleFormClose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDays = differenceInDays(dateRange.end, dateRange.start);
  const columnWidthPerDay = viewMode === ViewMode.Month ? 10 : viewMode === ViewMode.Week ? 28 : 56;
  const ganttHeight = Math.max(ganttTasks.length * 50 + 120, 600);
  const totalWidth = Math.max(totalDays * columnWidthPerDay, 1200);

  // Short date labels for pt-BR
  const getShortMonthLabel = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
  };

  const getShortWeekdayLabel = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  };

  // Render empty state or gantt content
  const scheduleBody = ganttTasks.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Calendar className="h-16 w-16 text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        Nenhuma atividade cadastrada no cronograma
      </p>
      <Button onClick={handleAddActivity}>
        <Plus className="h-4 w-4 mr-2" />
        Criar Primeira Atividade
      </Button>
    </div>
  ) : (
    <div className="space-y-4">
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Week)}
            className={viewMode === ViewMode.Week ? "bg-primary/10 border-primary" : ""}
          >
            Semana
          </Button>

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
          <Button size="sm" onClick={handleAddActivity} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Atividade
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

      <div 
        className={`${styles.archestraGantt} ${isFullScreen ? styles.fullscreen : ''}`}
        style={{
          '--gantt-total-width': `${totalWidth}px`,
          '--row-h': '50px',
        } as React.CSSProperties}
      >
        <div className={styles.ganttViewport}>
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            viewDate={dateRange.start}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onClick={handleTaskClick}
            locale="pt-BR"
            listCellWidth={isFullScreen ? "240px" : "200px"}
            columnWidth={columnWidthPerDay}
            ganttHeight={ganttHeight}
            barCornerRadius={999}
            todayColor="rgba(107, 125, 79, 0.08)"
            barProgressColor="rgba(255, 255, 255, 0.3)"
            barProgressSelectedColor="rgba(255, 255, 255, 0.5)"
            TooltipContent={({ task }) => {
            const activity = activities.find(a => a.id === task.id);
            if (!activity) return <div />;
            
            const duration = differenceInDays(
              new Date(activity.end_date),
              new Date(activity.start_date)
            ) + 1;
            
            return (
              <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs">
                <div className="font-semibold text-sm mb-2">{activity.name}</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Início:</span>
                    <span className="font-medium">
                      {format(new Date(activity.start_date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Fim:</span>
                    <span className="font-medium">
                      {format(new Date(activity.end_date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{duration} dias</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Progresso:</span>
                    <span className="font-medium">{activity.progress}%</span>
                  </div>
                  <div className="flex justify-between gap-4 items-center">
                    <span className="text-muted-foreground">Prioridade:</span>
                    <Badge 
                      variant={activity.priority === 'urgent' ? 'destructive' : 'secondary'} 
                      className="text-xs capitalize"
                    >
                      {activity.priority === 'urgent' ? 'Urgente' : 
                       activity.priority === 'high' ? 'Alta' :
                       activity.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">{activities.length}</p>
              <p className="text-sm text-muted-foreground">Atividades Totais</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-blue-600">
                {activities.filter(a => a.progress < 100).length}
              </p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-green-600">
                {activities.filter(a => a.progress === 100).length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-amber-600">
                {Math.round(
                  activities.reduce((sum, a) => sum + (a.progress || 0), 0) / activities.length || 0
                )}%
              </p>
              <p className="text-sm text-muted-foreground">Progresso Médio</p>
            </div>
          </CardContent>
        </Card>
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
                : "Planejamento de atividades ao longo do tempo"}
            </p>
          </div>
          {scheduleBody}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma do Projeto</CardTitle>
            <CardDescription>
              {projectStartDate && projectEndDate
                ? `${format(new Date(projectStartDate), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(projectEndDate), "dd/MM/yyyy", { locale: ptBR })}`
                : "Planeje as atividades do projeto ao longo do tempo"}
            </CardDescription>
          </CardHeader>
          <CardContent>{scheduleBody}</CardContent>
        </Card>
      )}

      <ActivityFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        activityId={selectedActivity?.id}
        initialData={selectedActivity || undefined}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Atividade"
        description="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita."
        isLoading={isDeleting}
      />
    </>
  );
}
