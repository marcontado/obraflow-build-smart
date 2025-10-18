import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, startOfDay, endOfDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface GanttChartProps {
  tasks: Task[];
  projectStartDate?: string;
  projectEndDate?: string;
}

const priorityColors = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export function GanttChart({ tasks, projectStartDate, projectEndDate }: GanttChartProps) {
  const tasksWithDates = useMemo(() => {
    return tasks.filter((task) => task.due_date);
  }, [tasks]);

  const { startDate, endDate, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const start = projectStartDate ? new Date(projectStartDate) : new Date();
      const end = projectEndDate ? new Date(projectEndDate) : addDays(start, 30);
      return {
        startDate: startOfDay(start),
        endDate: endOfDay(end),
        totalDays: differenceInDays(endOfDay(end), startOfDay(start)),
      };
    }

    const dates = tasksWithDates.map((t) => new Date(t.due_date!));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const start = projectStartDate
      ? new Date(Math.min(minDate.getTime(), new Date(projectStartDate).getTime()))
      : minDate;
    const end = projectEndDate
      ? new Date(Math.max(maxDate.getTime(), new Date(projectEndDate).getTime()))
      : maxDate;

    return {
      startDate: startOfDay(start),
      endDate: endOfDay(end),
      totalDays: differenceInDays(endOfDay(end), startOfDay(start)) || 1,
    };
  }, [tasksWithDates, projectStartDate, projectEndDate]);

  const getTaskPosition = (dueDate: string) => {
    const taskDate = new Date(dueDate);
    const daysFromStart = differenceInDays(taskDate, startDate);
    const position = (daysFromStart / totalDays) * 100;
    return Math.max(0, Math.min(100, position));
  };

  if (tasksWithDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronograma (Gantt)</CardTitle>
          <CardDescription>Visualize as tarefas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            Nenhuma tarefa com data de vencimento cadastrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma (Gantt)</CardTitle>
        <CardDescription>
          {format(startDate, "dd/MM/yyyy", { locale: ptBR })} -{" "}
          {format(endDate, "dd/MM/yyyy", { locale: ptBR })} ({totalDays} dias)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline ruler */}
          <div className="relative h-8 border-b border-border">
            <div className="absolute inset-0 flex justify-between px-2 text-xs text-muted-foreground">
              <span>{format(startDate, "dd/MM", { locale: ptBR })}</span>
              <span>{format(endDate, "dd/MM", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {tasksWithDates.map((task) => {
              const position = getTaskPosition(task.due_date!);
              const priorityColor = priorityColors[task.priority as keyof typeof priorityColors];

              return (
                <div key={task.id} className="relative">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium truncate flex-1">{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(task.due_date!), "dd/MM/yyyy", { locale: ptBR })}
                    </Badge>
                  </div>
                  <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className={`absolute top-0 bottom-0 w-2 ${priorityColor} rounded-full transition-all`}
                      style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
