import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  status: string;
  title: string;
  tasks: any[];
  onAddTask: () => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (task: any) => void;
  color: string;
}

export function TaskColumn({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  color,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Card className={cn("flex flex-col", isOver && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", color)} />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
