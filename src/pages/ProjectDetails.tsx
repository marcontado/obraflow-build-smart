import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectAreaCard } from "@/components/projects/ProjectAreaCard";
import { ProjectAreaFormDialog } from "@/components/projects/ProjectAreaFormDialog";
import { GanttChart } from "@/components/projects/GanttChart";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { supabase } from "@/integrations/supabase/client";
import { projectsService } from "@/services/projects.service";
import { projectAreasService } from "@/services/project-areas.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];

const statusColors = {
  planning: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-purple-500/10 text-purple-600 border-purple-200",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-200",
};

const statusLabels = {
  planning: "Planejamento",
  in_progress: "Em Andamento",
  completed: "Concluído",
  on_hold: "Em Espera",
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [projectAreas, setProjectAreas] = useState<ProjectArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<ProjectArea | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<ProjectArea | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchProject();
      fetchProjectAreas();
    };
    checkAuth();
  }, [id, navigate]);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await projectsService.getById(id);
      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      toast.error("Erro ao carregar projeto");
      console.error(error);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectAreas = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await projectAreasService.getByProject(id);
      if (error) throw error;
      if (data) setProjectAreas(data);
    } catch (error: any) {
      console.error("Erro ao carregar áreas:", error);
    }
  };

  const confirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      const { error } = await projectsService.delete(id);
      if (error) throw error;

      toast.success("Projeto excluído com sucesso!");
      navigate("/projects");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir projeto");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditArea = (area: ProjectArea) => {
    setAreaToEdit(area);
    setAreaDialogOpen(true);
  };

  const handleDeleteArea = (area: ProjectArea) => {
    setAreaToDelete(area);
  };

  const confirmDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      const { error } = await projectAreasService.delete(areaToDelete.id);
      if (error) throw error;
      
      toast.success("Área excluída com sucesso!");
      setAreaToDelete(null);
      fetchProjectAreas();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir área");
    }
  };

  const handleAreaDialogClose = () => {
    setAreaDialogOpen(false);
    setAreaToEdit(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Carregando..." subtitle="" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </main>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const budgetPercentage = project.budget && project.spent 
    ? (project.spent / project.budget) * 100 
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={project.name} subtitle={project.clients?.name || "Projeto"} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/projects")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormOpen(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                Excluir
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="areas">Áreas e Orçamentos</TabsTrigger>
              <TabsTrigger value="gantt">Cronograma</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <ProjectDashboard projectId={id!} />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>Informações do Projeto</CardTitle>
                    <Badge
                      variant="outline"
                      className={cn("border", statusColors[project.status as keyof typeof statusColors])}
                    >
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
                      <p className="text-sm">{project.description}</p>
                    </div>
                  )}

                  {project.clients?.name && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                      <p className="text-sm">{project.clients.name}</p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {project.start_date && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Data de Início</h4>
                        <p className="text-sm">{new Date(project.start_date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                    {project.end_date && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Data de Conclusão</h4>
                        <p className="text-sm">{new Date(project.end_date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">Progresso</h4>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {project.budget && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Orçamento</h4>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-2xl font-semibold">
                            R$ {project.spent?.toLocaleString() || "0"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            de R$ {project.budget.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">{budgetPercentage.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">usado</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="areas" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Áreas do Projeto</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie as diferentes áreas e seus orçamentos
                  </p>
                </div>
                <Button onClick={() => setAreaDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Área
                </Button>
              </div>

              {projectAreas.length > 0 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projectAreas.map((area) => (
                      <ProjectAreaCard
                        key={area.id}
                        area={area}
                        onEdit={() => handleEditArea(area)}
                        onDelete={() => handleDeleteArea(area)}
                      />
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo de Orçamentos por Área</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {projectAreas.map((area) => {
                          const areaBudget = Number(area.budget || 0);
                          const projectBudget = Number(project.budget || 0);
                          const percentage = projectBudget > 0 ? (areaBudget / projectBudget) * 100 : 0;

                          return (
                            <div key={area.id} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{area.name}</span>
                                <span className="text-muted-foreground">
                                  R$ {areaBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  {projectBudget > 0 && ` (${percentage.toFixed(1)}%)`}
                                </span>
                              </div>
                              {projectBudget > 0 && (
                                <Progress value={percentage} className="h-2" />
                              )}
                            </div>
                          );
                        })}
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Total Alocado</span>
                            <span>
                              R${" "}
                              {projectAreas
                                .reduce((sum, area) => sum + Number(area.budget || 0), 0)
                                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      Nenhuma área cadastrada. Crie a primeira área do projeto.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gantt">
              <GanttChart
                tasks={[]}
                projectStartDate={project.start_date || undefined}
                projectEndDate={project.end_date || undefined}
              />
            </TabsContent>

            <TabsContent value="tasks">
              <KanbanBoard projectId={id!} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ProjectFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchProject}
        projectId={project.id}
        initialData={project}
      />

      <ProjectAreaFormDialog
        open={areaDialogOpen}
        onClose={handleAreaDialogClose}
        onSuccess={fetchProjectAreas}
        projectId={id!}
        areaId={areaToEdit?.id}
        initialData={areaToEdit || undefined}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Excluir Projeto"
        description={`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita e todas as tarefas e áreas associadas serão perdidas.`}
      />

      <DeleteConfirmDialog
        open={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        onConfirm={confirmDeleteArea}
        isLoading={false}
        title="Excluir Área"
        description={`Tem certeza que deseja excluir a área "${areaToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
