import { useMemo, useCallback, useState } from "react";
import { Gantt, ViewMode, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { addDays, addMonths, differenceInDays, startOfDay, format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { tasksService } from "@/services/tasks.service";
import "./GanttChartStyles.css";

interface Task {
  id: string;
  title: string;
  due_date?: string | null;
  status?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  area_id?: string | null;
}

interface InteractiveGanttChartProps {
  projectId: string;
  tasks: Task[];
  onTasksChange?: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: "#DC2626",
  high: "#EA580C",
  medium: "#CA8A04",
  low: "#6B7D4F",
};

export function InteractiveGanttChart({ projectId, tasks, onTasksChange }: InteractiveGanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // -------- Transformação das tarefas --------
  const ganttTasks: GanttTask[] = useMemo(() => {
    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        // Use due_date as end date and calculate start as 1 day before for visualization
        const endDate = startOfDay(new Date(task.due_date!));
        const startDate = addDays(endDate, -1);

        return {
          id: task.id,
          name: task.title,
          start: startDate,
          end: endDate,
          type: "task" as const,
          progress: task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0,
          styles: {
            backgroundColor: priorityColors[task.priority || "medium"],
            backgroundSelectedColor: priorityColors[task.priority || "medium"],
            progressColor: "rgba(255,255,255,0.4)",
            progressSelectedColor: "rgba(255,255,255,0.6)",
          },
        };
      });
  }, [tasks]);

  // -------- Range de datas ajustável --------
  const dateRange = useMemo(() => {
    if (ganttTasks.length === 0) {
      const today = new Date();
      return { start: addMonths(today, -3), end: addMonths(today, 3) };
    }
    const dates = ganttTasks.flatMap((t) => [t.start, t.end]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    return { start: addMonths(minDate, -1), end: addMonths(maxDate, 1) };
  }, [ganttTasks]);

  // -------- Manipuladores --------
  const handleTaskChange = useCallback(
    async (task: GanttTask) => {
      try {
        const original = tasks.find((t) => t.id === task.id);
        if (!original) return;

        // Update due_date based on the end date
        await tasksService.update(task.id, {
          due_date: format(task.end, "yyyy-MM-dd"),
        });

        toast.success("Tarefa atualizada com sucesso!");
        onTasksChange?.();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar tarefa");
      }
    },
    [tasks, onTasksChange]
  );

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // -------- Layout Responsivo --------
  const columnWidth =
    viewMode === ViewMode.Month
      ? Math.max(window.innerWidth / 30, 10)
      : viewMode === ViewMode.Week
      ? Math.max(window.innerWidth / 14, 35)
      : 60;

  const totalDays = differenceInDays(dateRange.end, dateRange.start);
  const totalWidth = totalDays * columnWidth;
  const ganttHeight = Math.max(ganttTasks.length * 56 + 120, 600);

  return (
    <div
      className={`gantt-wrapper ${isFullScreen ? "fixed inset-0 z-50 bg-background" : ""}`}
      style={{ padding: isFullScreen ? "2rem" : "0" }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Day)}
            className={viewMode === ViewMode.Day ? "bg-primary/10 border-primary" : ""}
          >
            <ZoomIn className="h-4 w-4 mr-1" /> Dia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Week)}
            className={viewMode === ViewMode.Week ? "bg-primary/10 border-primary" : ""}
          >
            Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(ViewMode.Month)}
            className={viewMode === ViewMode.Month ? "bg-primary/10 border-primary" : ""}
          >
            <ZoomOut className="h-4 w-4 mr-1" /> Mês
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={toggleFullScreen}>
          {isFullScreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-1" /> Sair
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-1" /> Tela Cheia
            </>
          )}
        </Button>
      </div>

      <div
        className="gantt-container bg-background/50 border border-border rounded-lg overflow-auto"
        style={{
          height: isFullScreen ? "calc(100vh - 150px)" : "600px",
          minWidth: `${totalWidth}px`,
        }}
      >
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          viewDate={dateRange.start}
          onDateChange={handleTaskChange}
          columnWidth={columnWidth}
          ganttHeight={ganttHeight}
          listCellWidth="220px"
          barCornerRadius={24}
          todayColor="rgba(107,125,79,0.15)"
          locale="pt-BR"
        />
      </div>
    </div>
  );
}
