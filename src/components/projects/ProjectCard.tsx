import { Calendar, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  client?: string;
  status: string;
  progress: number;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  onClick?: () => void;
}

const statusColors = {
  planning: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-green-500/10 text-green-600 border-green-200",
  review: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  completed: "bg-purple-500/10 text-purple-600 border-purple-200",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-200",
};

const statusLabels = {
  planning: "Planejamento",
  in_progress: "Em Andamento",
  review: "Revisão",
  completed: "Concluído",
  on_hold: "Em Espera",
};

export function ProjectCard({
  name,
  client,
  status,
  progress,
  budget,
  spent,
  startDate,
  endDate,
  onClick,
}: ProjectCardProps) {
  const budgetPercentage = budget && spent ? (spent / budget) * 100 : 0;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge
            variant="outline"
            className={cn("border", statusColors[status as keyof typeof statusColors])}
          >
            {statusLabels[status as keyof typeof statusLabels]}
          </Badge>
        </div>
        {client && <p className="text-sm text-muted-foreground">{client}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {budget && spent !== undefined && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Orçamento</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                R$ {spent.toLocaleString()} / R$ {budget.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{budgetPercentage.toFixed(0)}% usado</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(startDate).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-1">
              <span>até {new Date(endDate).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
