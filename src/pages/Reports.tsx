import { useState, useEffect, useRef } from "react";
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

import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { ChangeEvent } from "react";
import { BrainCircuit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function Reports() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  
  // Guard: não renderizar se não houver workspace (ANTES de todos os hooks)
  if (!currentWorkspace) {
    return null;
  }

  const { hasFeature, getRequiredPlan } = useFeatureAccess();
  const [loading, setLoading] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [iaModalOpen, setIaModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const modalExpectedFileInputRef = useRef<HTMLInputElement>(null);

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

      // Buscar tarefas (filtrado ou todas) - SEMPRE filtrar por workspace - SEMPRE filtrar por workspace
      let tasksQuery = supabase
        
        .from("tasks")
        
        .select("id, status, project_id")
        .eq("workspace_id", currentWorkspace.id)
        .eq("workspace_id", currentWorkspace.id);
      
      if (projectId !== "all") {
        tasksQuery = tasksQuery.eq("project_id", projectId);
      }

      // Buscar clientes - SEMPRE filtrar por workspace
      // Buscar clientes - SEMPRE filtrar por workspace
      const clientsQuery = projectId === "all" 
        ? supabase.from("clients").select("id").eq("workspace_id", currentWorkspace.id).eq("workspace_id", currentWorkspace.id)
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


  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file || !currentWorkspace) return;

    // Busca o projeto selecionado
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (!selectedProject) {
      alert("Selecione um projeto para análise.");
      return;
    }

    try {
      setLoading(true);

      // Monta os dados para enviar ao n8n
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", selectedProject.id);
      formData.append("project_name", selectedProject.name);
      // Adicione outros campos relevantes do projeto se quiser
      // formData.append("client_name", selectedProject.client_name);

      // Envia para o webhook do n8n
      await fetch("https://seu-webhook.com/analyze-photo", {
        method: "POST",
        body: formData,
      });

      alert("Foto enviada para análise por IA!");
    } catch (error) {
      alert("Erro ao enviar a foto.");
      console.error(error);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleModalPhotoUpload() {
    const file = modalFileInputRef.current?.files?.[0];
    const expectedFile = modalExpectedFileInputRef.current?.files?.[0];
    const formData = new FormData();
    formData.append("real_photo", file);
    formData.append("expected_photo", expectedFile);
    if (!file || !expectedFile || !modalProjectId) {
      alert("Selecione uma obra e as fotos necessárias.");
      return;
    }
    const selectedProject = projects.find(p => p.id === modalProjectId);
    if (!selectedProject) {
      alert("Projeto inválido.");
      return;
    }
    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", selectedProject.id);
      formData.append("project_name", selectedProject.name);
      formData.append("expected_file", expectedFile);

      await fetch("https://matweber.app.n8n.cloud/webhook/a92b9f7b-7db6-4971-96b6-43e9b079fb10", {
        method: "POST",
        body: formData,
      });

      alert("Fotos enviadas para análise por IA!");
      setIaModalOpen(false);
      setModalProjectId("");
      if (modalFileInputRef.current) modalFileInputRef.current.value = "";
      if (modalExpectedFileInputRef.current) modalExpectedFileInputRef.current.value = "";
    } catch (error) {
      alert("Erro ao enviar as fotos.");
      console.error(error);
    } finally {
      setModalLoading(false);
    }
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
              {/* Botão de upload de foto com IA */}
              <button
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
                type="button"
                onClick={() => setIaModalOpen(true)}
                title="Envie uma foto da obra para análise automática por IA"
              >
                <BrainCircuit className="w-5 h-5" />
                Analisar foto com IA
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
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
      <Dialog open={iaModalOpen} onOpenChange={setIaModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                Análise Inteligente de Foto da Obra
              </div>
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Envie uma foto da obra para análise automática por IA. Escolha a obra e faça upload da imagem.
            </p>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleModalPhotoUpload();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="obra-select">
                Obra
              </label>
              <Select
                value={modalProjectId}
                onValueChange={setModalProjectId}
                required
              >
                <SelectTrigger id="obra-select" className="w-full">
                  <SelectValue placeholder="Selecione a obra..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="real-photo">
                Foto real da obra
              </label>
              <input
                id="real-photo"
                ref={modalFileInputRef}
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="expected-photo">
                Template/Imagem esperada
              </label>
              <input
                id="expected-photo"
                ref={modalExpectedFileInputRef}
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={modalLoading}
                className="gap-2 bg-purple-600 text-white hover:bg-purple-700"
              >
                <BrainCircuit className="h-4 w-4" />
                {modalLoading ? "Enviando..." : "Enviar para IA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Reports;


