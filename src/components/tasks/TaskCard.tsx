import { Calendar, Clock, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  urgent: "bg-red-500/10 text-red-600 border-red-200",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

interface TaskCardProps {
  task: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors])}
          >
            {priorityLabels[task.priority as keyof typeof priorityLabels]}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
          {task.profiles?.full_name && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{task.profiles.full_name}</span>
            </div>
          )}
        </div>

        {task.project_areas?.name && (
          <div className="text-xs text-muted-foreground">
            📍 {task.project_areas.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
