import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { FolderKanban, Users, CheckSquare, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalBudget: 0,
    totalSpent: 0,
  });
  const [projectsByStatus, setProjectsByStatus] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        await fetchReportData();
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Buscar totais
      const [projectsRes, clientsRes, tasksRes] = await Promise.all([
        supabase.from("projects").select("id, status, budget, spent"),
        supabase.from("clients").select("id"),
        supabase.from("tasks").select("id, status"),
      ]);

      // Calcular estatísticas
      const projects = projectsRes.data || [];
      const clients = clientsRes.data || [];
      const tasks = tasksRes.data || [];

      const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0);
      const completedTasks = tasks.filter(t => t.status === "done").length;

      setStats({
        totalProjects: projects.length,
        totalClients: clients.length,
        totalTasks: tasks.length,
        completedTasks,
        totalBudget,
        totalSpent,
      });

      // Projetos por status
      const statusCount = projects.reduce((acc: any, project) => {
        const status = project.status || "planning";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const statusLabels: Record<string, string> = {
        planning: "Planejamento",
        in_progress: "Em Progresso",
        review: "Revisão",
        completed: "Concluído",
        on_hold: "Em Espera",
      };

      setProjectsByStatus(
        Object.entries(statusCount).map(([key, value]) => ({
          name: statusLabels[key] || key,
          value,
        }))
      );

      // Tarefas por status
      const taskStatusCount = tasks.reduce((acc: any, task) => {
        const status = task.status || "todo";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const taskStatusLabels: Record<string, string> = {
        todo: "A Fazer",
        in_progress: "Em Progresso",
        review: "Revisão",
        done: "Concluído",
      };

      setTasksByStatus(
        Object.entries(taskStatusCount).map(([key, value]) => ({
          name: taskStatusLabels[key] || key,
          value,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const budgetData = [
    { name: "Orçado", value: stats.totalBudget },
    { name: "Gasto", value: stats.totalSpent },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Relatórios" subtitle="Análises e métricas dos seus projetos" />
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                  title="Total de Projetos"
                  value={stats.totalProjects}
                  icon={FolderKanban}
                />
                <StatsCard
                  title="Total de Clientes"
                  value={stats.totalClients}
                  icon={Users}
                />
                <StatsCard
                  title="Tarefas Totais"
                  value={stats.totalTasks}
                  icon={Clock}
                />
                <StatsCard
                  title="Tarefas Concluídas"
                  value={stats.completedTasks}
                  description={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% do total`}
                  icon={CheckSquare}
                />
                <StatsCard
                  title="Orçamento Total"
                  value={`R$ ${stats.totalBudget.toLocaleString("pt-BR")}`}
                  icon={DollarSign}
                />
                <StatsCard
                  title="Total Gasto"
                  value={`R$ ${stats.totalSpent.toLocaleString("pt-BR")}`}
                  description={`${stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}% do orçamento`}
                  icon={TrendingUp}
                />
              </div>

              {/* Gráficos */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Gráfico de Projetos por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos por Status</CardTitle>
                    <CardDescription>Distribuição dos projetos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projectsByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={projectsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                          >
                            {projectsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Nenhum projeto cadastrado</p>
                    )}
                  </CardContent>
                </Card>

                {/* Gráfico de Tarefas por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas por Status</CardTitle>
                    <CardDescription>Distribuição das tarefas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasksByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksByStatus}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Nenhuma tarefa cadastrada</p>
                    )}
                  </CardContent>
                </Card>

                {/* Gráfico de Orçamento vs Gasto */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Orçamento vs Gasto</CardTitle>
                    <CardDescription>Comparação financeira</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
