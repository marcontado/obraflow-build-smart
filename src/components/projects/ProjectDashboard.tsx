import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  CheckCircle2, 
  ListTodo, 
  TrendingUp, 
  AlertCircle,
  DollarSign 
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { projectStatsService } from "@/services/project-stats.service";

interface ProjectDashboardProps {
  projectId: string;
}

const COLORS = {
  todo: "hsl(var(--chart-1))",
  in_progress: "hsl(var(--chart-2))",
  review: "hsl(var(--chart-3))",
  done: "hsl(var(--chart-4))",
};

const STATUS_LABELS = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Em Revisão",
  done: "Concluído",
};

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await projectStatsService.getProjectStats(projectId);
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Erro ao carregar estatísticas</div>;
  }

  const taskStatusData = [
    { name: STATUS_LABELS.todo, value: stats.tasksByStatus.todo, fill: COLORS.todo },
    { name: STATUS_LABELS.in_progress, value: stats.tasksByStatus.in_progress, fill: COLORS.in_progress },
    { name: STATUS_LABELS.review, value: stats.tasksByStatus.review, fill: COLORS.review },
    { name: STATUS_LABELS.done, value: stats.tasksByStatus.done, fill: COLORS.done },
  ].filter((item) => item.value > 0);

  const budgetData = [
    {
      name: "Orçado",
      value: stats.projectBudget,
    },
    {
      name: "Gasto",
      value: stats.projectSpent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Tarefas"
          value={stats.totalTasks}
          icon={ListTodo}
        />
        <StatsCard
          title="Taxa de Conclusão"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Tarefas Concluídas"
          value={stats.tasksByStatus.done}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Tarefas Atrasadas"
          value={stats.overdueTasks}
          icon={AlertCircle}
        />
      </div>

      {/* Cards de Orçamento */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Orçamento do Projeto"
          value={`R$ ${stats.projectBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Gasto"
          value={`R$ ${stats.projectSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          description={`${Math.round((stats.projectSpent / stats.projectBudget) * 100)}% do orçamento`}
          icon={DollarSign}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Tarefas por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma tarefa cadastrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Orçamento vs Gasto */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamento vs Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orçamento por Área (se houver áreas) */}
      {stats.budgetByArea.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Orçamento por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.budgetByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
                <Bar dataKey="budget" fill="hsl(var(--chart-2))" name="Orçamento (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
