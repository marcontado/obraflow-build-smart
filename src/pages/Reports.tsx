import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureUpgradeCard } from "@/components/plans/FeatureUpgradeCard";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { FolderKanban, Users, CheckSquare, Clock, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

function Reports() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { hasFeature, getRequiredPlan } = useFeatureAccess();
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [projects, setProjects] = useState<any[]>([]);
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
    if (currentWorkspace) {
      fetchProjectsList();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if ((projects.length > 0 || selectedProjectId === "all") && currentWorkspace) {
      fetchReportData(selectedProjectId);
    }
  }, [selectedProjectId, currentWorkspace]);

  const fetchProjectsList = async () => {
    if (!currentWorkspace) return;

    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .eq("workspace_id", currentWorkspace.id)
      .order("name");
    
    setProjects(data || []);
    if (data && data.length > 0) {
      fetchReportData("all");
    } else {
      setLoading(false);
    }
  };

  const fetchReportData = async (projectId: string) => {
    if (!currentWorkspace) return;

    setLoading(true);
    try {
      // Buscar projetos (filtrado ou todos) - SEMPRE filtrar por workspace
      let projectsQuery = supabase
        .from("projects")
        .select("id, status, budget, spent")
        .eq("workspace_id", currentWorkspace.id);
      
      if (projectId !== "all") {
        projectsQuery = projectsQuery.eq("id", projectId);
      }

      // Buscar tarefas (filtrado ou todas) - SEMPRE filtrar por workspace
      let tasksQuery = supabase
        .from("tasks")
        .select("id, status, project_id")
        .eq("workspace_id", currentWorkspace.id);
      
      if (projectId !== "all") {
        tasksQuery = tasksQuery.eq("project_id", projectId);
      }

      // Buscar clientes - SEMPRE filtrar por workspace
      const clientsQuery = projectId === "all" 
        ? supabase.from("clients").select("id").eq("workspace_id", currentWorkspace.id)
        : Promise.resolve({ data: [] });

      const [projectsRes, clientsRes, tasksRes] = await Promise.all([
        projectsQuery,
        clientsQuery,
        tasksQuery,
      ]);

      // Calcular estatísticas
      const projects = projectsRes.data || [];
      const clients = clientsRes.data || [];
      const tasks = tasksRes.data || [];

      const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0);
      const completedTasks = tasks.filter(t => t.status === "done").length;

      setStats({
        totalProjects: projectId === "all" ? projects.length : 1,
        totalClients: projectId === "all" ? clients.length : 0,
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

  // Função para exportar PDF
  const handleExportPDF = () => {
    if (!currentWorkspace) return;
    const doc = new jsPDF();
    const isGeral = selectedProjectId === "all";
    const workspaceName = currentWorkspace.name || "Escritório";
    let title = isGeral ? `Relatório Geral - ${workspaceName}` : `Relatório da Obra`;
    let y = 14;
    doc.setFontSize(16);
    doc.text(title, 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, y);
    y += 10;
    doc.text(`Escritório: ${workspaceName}`, 14, y);
    y += 8;
    if (!isGeral) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        doc.text(`Projeto: ${project.name}`, 14, y);
        y += 8;
        if (project.client_name) {
          doc.text(`Cliente: ${project.client_name}`, 14, y);
          y += 8;
        }
      }
    }
    y += 2;
    // Tabela de estatísticas
    const tableBody = [];
    if (isGeral) {
      tableBody.push(["Total de Projetos", stats.totalProjects]);
      tableBody.push(["Total de Clientes", stats.totalClients]);
    }
    tableBody.push(["Tarefas Totais", stats.totalTasks]);
    tableBody.push(["Tarefas Concluídas", stats.completedTasks]);
    tableBody.push([isGeral ? "Orçamento Total" : "Orçamento do Projeto", `R$ ${stats.totalBudget.toLocaleString("pt-BR")}`]);
    tableBody.push([isGeral ? "Total Gasto" : "Gasto do Projeto", `R$ ${stats.totalSpent.toLocaleString("pt-BR")}`]);
    autoTable(doc, {
      startY: y + 4,
      head: [["Indicador", "Valor"]],
      body: tableBody,
    });
    doc.save(isGeral ? `relatorio-geral.pdf` : `relatorio-obra.pdf`);
  };

  // Guard adicional: não renderizar se não houver workspace
  if (!currentWorkspace) {
    return null;
  }

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const budgetData = [
    { name: "Orçado", value: stats.totalBudget },
    { name: "Gasto", value: stats.totalSpent },
  ];

  const chartConfig = {
    value: {
      label: "Valor",
      color: "hsl(var(--primary))",
    },
  };

  // Verificar acesso à feature
  if (!hasFeature('reports')) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Relatórios" subtitle="Análises e métricas dos seus projetos" />
          <main className="flex-1 overflow-y-auto p-6">
            <FeatureUpgradeCard
              title="Relatórios Avançados"
              description="Acesse análises detalhadas, métricas de projetos, gráficos e exportação de dados"
              requiredPlan={getRequiredPlan('reports')}
              icon={<BarChart3 className="h-6 w-6" />}
            />
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Relatórios" subtitle="Análises e métricas dos seus projetos" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedProjectId === "all" 
                  ? "Visão Geral - Todos os Projetos"
                  : `Projeto: ${projects.find(p => p.id === selectedProjectId)?.name || ""}`
                }
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProjectId === "all" 
                  ? "Análise consolidada de todos os seus projetos"
                  : "Análise detalhada do projeto selecionado"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow"
              >
                Exportar PDF
              </button>
              <div className="w-64">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Projetos</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
                {selectedProjectId === "all" && (
                  <>
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
                  </>
                )}
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
                  title={selectedProjectId === "all" ? "Orçamento Total" : "Orçamento do Projeto"}
                  value={`R$ ${stats.totalBudget.toLocaleString("pt-BR")}`}
                  icon={DollarSign}
                />
                <StatsCard
                  title={selectedProjectId === "all" ? "Total Gasto" : "Gasto do Projeto"}
                  value={`R$ ${stats.totalSpent.toLocaleString("pt-BR")}`}
                  description={`${stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}% do orçamento`}
                  icon={TrendingUp}
                />
              </div>

              {/* Gráficos */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Gráfico de Projetos por Status - só mostrar se for "todos" */}
                {selectedProjectId === "all" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Projetos por Status</CardTitle>
                      <CardDescription>Distribuição dos projetos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projectsByStatus.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[300px]">
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
                        </ChartContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-12">Nenhum projeto cadastrado</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Gráfico de Tarefas por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas por Status</CardTitle>
                    <CardDescription>Distribuição das tarefas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasksByStatus.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <BarChart data={tasksByStatus}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
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
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
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

export default Reports;
