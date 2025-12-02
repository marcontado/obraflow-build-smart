import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import styles from "./GanttShell.module.css";
import {
  format,
  addDays,
  startOfDay,
  differenceInDays,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { projectActivitiesService } from "@/services/project-activities.service";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchActivities = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } =
        await projectActivitiesService.getByProject(
          projectId,
          currentWorkspace.id
        );
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Erro ao carregar atividades do cronograma");
    } finally {
      setLoading(false);
    }
  };

  const systemCalendar = useMemo(() => {
    const now = new Date();
    const localNow = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    const weekStart = startOfWeek(localNow, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(localNow, { weekStartsOn: 1 });
    const monthStart = startOfMonth(localNow);
    const monthEnd = endOfMonth(localNow);

    return {
      today: startOfDay(localNow),
      startOfWeek: weekStart,
      endOfWeek: weekEnd,
      startOfMonth: monthStart,
      endOfMonth: monthEnd,
    };
  }, []);

  const dateRange = useMemo(() => {
    let baseRange;

    switch (viewMode) {
      case ViewMode.Day:
        baseRange = {
          start: systemCalendar.today,
          end: endOfDay(systemCalendar.today),
        };
        break;
      case ViewMode.Week:
        baseRange = {
          start: systemCalendar.startOfWeek,
          end: systemCalendar.endOfWeek,
        };
        break;
      case ViewMode.Month:
      default:
        baseRange = {
          start: systemCalendar.startOfMonth,
          end: systemCalendar.endOfMonth,
        };
        break;
    }

    if (projectStartDate && projectEndDate) {
      const projectStart = new Date(projectStartDate);
      const projectEnd = new Date(projectEndDate);

      return {
        start: projectStart < baseRange.start ? projectStart : baseRange.start,
        end: projectEnd > baseRange.end ? projectEnd : baseRange.end,
      };
    }

    return baseRange;
  }, [projectStartDate, projectEndDate, viewMode, systemCalendar]);

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
        backgroundSelectedColor:
          priorityColors[activity.priority || "medium"],
        progressColor: "rgba(255, 255, 255, 0.4)",
        progressSelectedColor: "rgba(255, 255, 255, 0.6)",
      },
    }));
  }, [activities]);

  const ganttMetrics = useMemo(() => {
    const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;

    let adaptiveColumnWidth;

    if (viewMode === ViewMode.Day) {
      adaptiveColumnWidth = 120;
    } else if (viewMode === ViewMode.Week) {
      adaptiveColumnWidth = Math.max(100, 700 / totalDays);
    } else {
      adaptiveColumnWidth = Math.max(40, 1200 / totalDays);
    }

    const totalWidth = Math.max(totalDays * adaptiveColumnWidth, 1200);
    const ganttHeight = Math.max(ganttTasks.length * 50 + 120, 600);

    return {
      totalDays,
      totalWidth,
      ganttHeight,
      columnWidth: adaptiveColumnWidth,
    };
  }, [dateRange, ganttTasks, viewMode]);

  const handleTaskChange = useCallback(
    async (task: GanttTask) => {
      if (!currentWorkspace) return;

      try {
        const newStartDate = format(task.start, "yyyy-MM-dd");
        const newEndDate = format(task.end, "yyyy-MM-dd");

        await projectActivitiesService.update(
          task.id,
          {
            start_date: newStartDate,
            end_date: newEndDate,
          },
          currentWorkspace.id
        );

        toast.success("Atividade atualizada!");
        fetchActivities();
      } catch (error) {
        console.error("Error updating activity:", error);
        toast.error("Erro ao atualizar atividade");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!activityToDelete || !currentWorkspace) return;

    setIsDeleting(true);
    const { error } = await projectActivitiesService.delete(
      activityToDelete.id,
      currentWorkspace.id
    );

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
    if (!currentWorkspace) {
      toast.error(
        "Nenhum workspace selecionado. Por favor, selecione um workspace."
      );
      return;
    }

    setSelectedActivity(null);
    setFormOpen(true);
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

  const { totalDays, totalWidth, ganttHeight, columnWidth } = ganttMetrics;

  const scheduleBody =
    ganttTasks.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Calendar className="h-14 w-14 text-muted-foreground/70" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhuma atividade cadastrada
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Comece criando a primeira atividade do cronograma. Você poderá
            ajustar datas arrastando as barras na linha do tempo.
          </p>
        </div>
        <Button onClick={handleAddActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Criar primeira atividade
        </Button>
      </div>
    ) : (
      <div className="space-y-4">
        {/* CONTROLES SUPERIORES */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-full bg-muted/40 px-1 py-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      viewMode === ViewMode.Day ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setViewMode(ViewMode.Day)}
                    className="rounded-full px-4 gap-1 shadow-none"
                  >
                    <ZoomIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Dia</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Visualização detalhada por dia
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant={
                viewMode === ViewMode.Week ? "default" : "ghost"
              }
              size="sm"
              onClick={() => setViewMode(ViewMode.Week)}
              className="rounded-full px-4 shadow-none"
            >
              Semana
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      viewMode === ViewMode.Month ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setViewMode(ViewMode.Month)}
                    className="rounded-full px-4 gap-1 shadow-none"
                  >
                    <ZoomOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Mês</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualização mensal</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddActivity}
              className="shadow-sm rounded-full px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova atividade
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="shadow-sm rounded-full px-4"
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Sair
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Visualização completa
                </>
              )}
            </Button>
          </div>
        </div>

        {/* LEGENDA DE PRIORIDADE */}
        <div className="flex items-center gap-4 flex-wrap p-3 bg-muted/40 rounded-xl border">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Prioridade
          </span>
          <div className="flex flex-wrap gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: priorityColors.urgent }}
            >
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Urgente
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: priorityColors.high }}
            >
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Alta
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: priorityColors.medium }}
            >
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Média
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: priorityColors.low }}
            >
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Baixa
            </div>
          </div>
        </div>

        {/* GANTT */}
        <div
          className={`${styles.archestraGantt} ${
            isFullScreen ? styles.fullscreen : ""
          }`}
          style={{
            height: isFullScreen ? "calc(100vh - 250px)" : "650px",
          }}
        >
          <div
            className={styles.ganttViewport}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <div
              className={styles.ganttInner}
              style={{
                minWidth: `${Math.max(totalWidth, 1200)}px`,
                height: "100%",
              }}
            >
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                viewDate={addDays(
                  dateRange.start,
                  Math.floor(totalDays / 2)
                )}
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onClick={handleTaskClick}
                locale="pt-BR"
                listCellWidth={isFullScreen ? "240px" : "200px"}
                columnWidth={Math.max(columnWidth, 90)}
                ganttHeight={ganttHeight}
                barCornerRadius={999}
                barFill={85}
                rowHeight={44}
                headerHeight={56}
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                fontSize="12px"
                todayColor="rgba(107, 125, 79, 0.08)"
                barProgressColor="rgba(255, 255, 255, 0.3)"
                barProgressSelectedColor="rgba(255, 255, 255, 0.5)"
                arrowColor="rgba(148, 163, 184, 0.9)"
                TooltipContent={({ task }) => {
                  const activity = activities.find(
                    (a) => a.id === task.id
                  );
                  if (!activity) return <div />;

                  const duration =
                    differenceInDays(
                      new Date(activity.end_date),
                      new Date(activity.start_date)
                    ) + 1;

                  return (
                    <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs text-xs space-y-1.5">
                      <div className="font-semibold text-sm mb-1">
                        {activity.name}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Início:
                        </span>
                        <span className="font-medium">
                          {format(
                            new Date(activity.start_date),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Fim:
                        </span>
                        <span className="font-medium">
                          {format(
                            new Date(activity.end_date),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Duração:
                        </span>
                        <span className="font-medium">
                          {duration} dias
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Progresso:
                        </span>
                        <span className="font-medium">
                          {activity.progress}%
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 items-center pt-1">
                        <span className="text-muted-foreground">
                          Prioridade:
                        </span>
                        <Badge
                          variant={
                            activity.priority === "urgent"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] capitalize"
                        >
                          {activity.priority === "urgent"
                            ? "Urgente"
                            : activity.priority === "high"
                            ? "Alta"
                            : activity.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                        </Badge>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* CARDS RESUMO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <Card className="border shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Atividades totais
                </p>
                <p className="text-4xl font-semibold tracking-tight">
                  {activities.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Em andamento
                </p>
                <p className="text-4xl font-semibold tracking-tight text-blue-600">
                  {
                    activities.filter(
                      (a) => (a.progress || 0) > 0 && (a.progress || 0) < 100
                    ).length
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Concluídas
                </p>
                <p className="text-4xl font-semibold tracking-tight text-green-600">
                  {
                    activities.filter(
                      (a) => (a.progress || 0) === 100
                    ).length
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Progresso médio
                </p>
                <p className="text-4xl font-semibold tracking-tight text-amber-600">
                  {Math.round(
                    activities.length
                      ? activities.reduce(
                          (sum, a) => sum + (a.progress || 0),
                          0
                        ) / activities.length
                      : 0
                  )}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  return (
    <>
      {isFullScreen ? (
        <div className="fixed inset-0 z-50 bg-background p-6 overflow-auto animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Cronograma do Projeto
              </h2>
              <p className="text-sm text-muted-foreground">
                {projectStartDate && projectEndDate
                  ? `${format(new Date(projectStartDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })} - ${format(
                      new Date(projectEndDate),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}`
                  : "Planejamento de atividades ao longo do tempo"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="rounded-full"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
          {scheduleBody}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma do Projeto</CardTitle>
            <CardDescription>
              {projectStartDate && projectEndDate
                ? `${format(new Date(projectStartDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })} - ${format(new Date(projectEndDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}`
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

