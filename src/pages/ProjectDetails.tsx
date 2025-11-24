import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Plus, Calendar } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { FeatureUpgradeCard } from "@/components/plans/FeatureUpgradeCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { ProjectWizard } from "@/components/projects/wizard/ProjectWizard";
import { ProjectAreaCard } from "@/components/projects/ProjectAreaCard";
import { ProjectAreaFormDialog } from "@/components/projects/ProjectAreaFormDialog";
import { ProjectSchedule } from "@/components/projects/ProjectSchedule";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { ProjectBriefingView } from "@/components/projects/ProjectBriefingView";
import { ProjectSitePhotosView } from "@/components/projects/ProjectSitePhotosView";
import { ProjectMoodboardView } from "@/components/projects/ProjectMoodboardView";
import { ProjectFilesView } from "@/components/projects/ProjectFilesView";
import "@/components/projects/GanttChartStyles.css";
import { supabase } from "@/integrations/supabase/client";
import { projectsService } from "@/services/projects.service";
import { projectAreasService } from "@/services/project-areas.service";
import { tasksService } from "@/services/tasks.service";
import { budgetCategoriesService } from "@/services/budget-categories.service";
import { budgetItemsService } from "@/services/budget-items.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { projectTypes } from "@/types/project.types";
import type { Database } from "@/integrations/supabase/types";
import type { BudgetCategory, BudgetItemWithRelations } from "@/types/budget.types";
import type { BudgetCategoryFormData } from "@/schemas/budget-category.schema";
import type { BudgetItemFormData } from "@/schemas/budget-item.schema";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { BudgetItemFormDialog } from "@/components/budget/BudgetItemFormDialog";
import { BudgetItemsTable } from "@/components/budget/BudgetItemsTable";
import { BudgetCategoryManager } from "@/components/budget/BudgetCategoryManager";
import { BudgetCategorySection } from "@/components/budget/BudgetCategorySection";

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

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { hasFeature, getRequiredPlan } = useFeatureAccess();
  const [project, setProject] = useState<any>(null);
  const [projectAreas, setProjectAreas] = useState<ProjectArea[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<ProjectArea | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<ProjectArea | null>(null);
  
  // Budget states
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemWithRelations[]>([]);
  const [budgetItemDialogOpen, setBudgetItemDialogOpen] = useState(false);
  const [budgetItemToEdit, setBudgetItemToEdit] = useState<BudgetItemWithRelations | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchProject();
      fetchProjectAreas();
      fetchProjectTasks();
      fetchBudgetCategories();
      fetchBudgetItems();
    }
  }, [id, currentWorkspace]);

  const fetchProject = async () => {
    if (!id || !currentWorkspace) return;
    
    if (isFirstMount.current) {
      setLoading(true);
    }
    
    try {
      const { data, error } = await projectsService.getById(id, currentWorkspace.id);
      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      toast.error("Erro ao carregar projeto");
      console.error(error);
      navigate("/app/projects");
    } finally {
      setLoading(false);
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
  };

  const fetchProjectAreas = async () => {
    if (!id || !currentWorkspace) return;
    
    try {
      const { data, error } = await projectAreasService.getByProject(id, currentWorkspace.id);
      if (error) throw error;
      if (data) setProjectAreas(data);
    } catch (error: any) {
      console.error("Erro ao carregar áreas:", error);
    }
  };

  const fetchProjectTasks = async () => {
    if (!id || !currentWorkspace) return;
    
    try {
      const { data, error } = await tasksService.getByProject(id, currentWorkspace.id);
      if (error) throw error;
      if (data) setProjectTasks(data);
    } catch (error: any) {
      console.error("Erro ao carregar tarefas:", error);
    }
  };

  const confirmDelete = async () => {
    if (!id || !currentWorkspace) return;

    try {
      setDeleting(true);
      const { error } = await projectsService.delete(id, currentWorkspace.id);
      if (error) throw error;

      toast.success("Projeto excluído com sucesso!");
      navigate("/app/projects");
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
    if (!areaToDelete || !currentWorkspace) return;

    try {
      const { error } = await projectAreasService.delete(areaToDelete.id, currentWorkspace.id);
      if (error) throw error;
      
      toast.success("Área excluída com sucesso!");
      setAreaToDelete(null);
      fetchProjectAreas();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir área");
    }
  };

  // Budget functions
  const fetchBudgetCategories = async () => {
    if (!currentWorkspace) return;
    try {
      const { data, error } = await budgetCategoriesService.getByWorkspace(currentWorkspace.id);
      if (error) throw error;
      if (!data || data.length === 0) {
        await budgetCategoriesService.seedDefaultCategories(currentWorkspace.id);
        fetchBudgetCategories();
        return;
      }
      setBudgetCategories(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const fetchBudgetItems = async () => {
    if (!id || !currentWorkspace) return;
    try {
      const { data, error } = await budgetItemsService.getByProject(id, currentWorkspace.id);
      if (error) throw error;
      setBudgetItems(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar itens:", error);
    }
  };

  const handleCreateCategory = async (data: BudgetCategoryFormData) => {
    if (!currentWorkspace) return;
    try {
      const maxOrder = budgetCategories.reduce((max, cat) => Math.max(max, cat.sort_order || 0), 0);
      const { error } = await budgetCategoriesService.create({
        name: data.name,
        description: data.description || null,
        color: data.color,
        icon: data.icon,
        workspace_id: currentWorkspace.id,
        sort_order: maxOrder + 1,
      });
      if (error) throw error;
      toast.success("Categoria criada com sucesso");
      fetchBudgetCategories();
    } catch (error: any) {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleCreateBudgetItem = async (data: BudgetItemFormData) => {
    if (!id || !currentWorkspace) return;
    try {
      const { data: user } = await supabase.auth.getUser();
      let measurementWithMargin = data.measurement_base ? parseFloat(data.measurement_base) : null;
      if (data.add_margin && measurementWithMargin) measurementWithMargin *= 1.1;
      const qty = data.quantity ? parseFloat(data.quantity) : 0;
      const selectedPrice = data.selected_store === "main" ? (data.unit_price ? parseFloat(data.unit_price) : 0) : (data.alternative_unit_price ? parseFloat(data.alternative_unit_price) : 0);
      const total = qty * selectedPrice;
      const { error } = await budgetItemsService.create({
        workspace_id: currentWorkspace.id, project_id: id, category_id: data.category_id, area_id: data.area_id || null,
        item_name: data.item_name, executor: data.executor || null, description: data.description || null, status: data.status,
        measurement_unit: data.measurement_unit, measurement_base: data.measurement_base ? parseFloat(data.measurement_base) : null,
        measurement_with_margin: measurementWithMargin, measurement_purchased: data.measurement_purchased ? parseFloat(data.measurement_purchased) : null,
        quantity: qty || null, store_name: data.store_name || null, product_code: data.product_code || null,
        unit_price: data.unit_price ? parseFloat(data.unit_price) : null, store_link: data.store_link || null,
        alternative_store_name: data.alternative_store_name || null, alternative_product_code: data.alternative_product_code || null,
        alternative_unit_price: data.alternative_unit_price ? parseFloat(data.alternative_unit_price) : null,
        alternative_store_link: data.alternative_store_link || null, selected_store: data.selected_store, total_price: total || null,
        deadline: data.deadline || null, notes: data.notes || null, created_by: user?.user?.id || null,
      });
      if (error) throw error;
      toast.success("Item criado");
      fetchBudgetItems();
      fetchProjectAreas();
      fetchProject();
    } catch (error: any) {
      toast.error("Erro ao criar item");
    }
  };

  const handleEditBudgetItem = async (data: BudgetItemFormData) => {
    if (!budgetItemToEdit || !currentWorkspace) return;
    try {
      let measurementWithMargin = data.measurement_base ? parseFloat(data.measurement_base) : null;
      if (data.add_margin && measurementWithMargin) measurementWithMargin *= 1.1;
      const qty = data.quantity ? parseFloat(data.quantity) : 0;
      const selectedPrice = data.selected_store === "main" ? (data.unit_price ? parseFloat(data.unit_price) : 0) : (data.alternative_unit_price ? parseFloat(data.alternative_unit_price) : 0);
      const total = qty * selectedPrice;
      const { error } = await budgetItemsService.update(budgetItemToEdit.id, {
        category_id: data.category_id, area_id: data.area_id || null, item_name: data.item_name, executor: data.executor || null,
        description: data.description || null, status: data.status, measurement_unit: data.measurement_unit,
        measurement_base: data.measurement_base ? parseFloat(data.measurement_base) : null, measurement_with_margin: measurementWithMargin,
        measurement_purchased: data.measurement_purchased ? parseFloat(data.measurement_purchased) : null, quantity: qty || null,
        store_name: data.store_name || null, product_code: data.product_code || null, unit_price: data.unit_price ? parseFloat(data.unit_price) : null,
        store_link: data.store_link || null, alternative_store_name: data.alternative_store_name || null,
        alternative_product_code: data.alternative_product_code || null, alternative_unit_price: data.alternative_unit_price ? parseFloat(data.alternative_unit_price) : null,
        alternative_store_link: data.alternative_store_link || null, selected_store: data.selected_store, total_price: total || null,
        deadline: data.deadline || null, notes: data.notes || null,
      }, currentWorkspace.id);
      if (error) throw error;
      toast.success("Item atualizado");
      setBudgetItemToEdit(null);
      fetchBudgetItems();
      fetchProjectAreas();
      fetchProject();
    } catch (error: any) {
      toast.error("Erro ao atualizar item");
    }
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    if (!currentWorkspace || !confirm("Excluir este item?")) return;
    try {
      const { error } = await budgetItemsService.delete(itemId, currentWorkspace.id);
      if (error) throw error;
      toast.success("Item excluído");
      fetchBudgetItems();
      fetchProjectAreas();
      fetchProject();
    } catch (error: any) {
      toast.error("Erro ao excluir item");
    }
  };

  const handleDuplicateBudgetItem = (item: BudgetItemWithRelations) => {
    setBudgetItemToEdit({ ...item, id: "", item_name: `${item.item_name} (Cópia)` } as any);
    setBudgetItemDialogOpen(true);
  };

  const getBudgetTotals = () => {
    const totalBudget = Number(project?.budget || 0);
    const totalSpent = budgetItems.filter((item) => item.status === "comprado" || item.status === "aplicado").reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const totalQuoted = budgetItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    return { totalBudget, totalSpent, totalQuoted };
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
            <Button variant="ghost" onClick={() => navigate("/app/projects")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Excluir
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="areas">Áreas</TabsTrigger>
              <TabsTrigger value="budget">Orçamento Detalhado</TabsTrigger>
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
                    <div className="flex items-center gap-3">
                      <CardTitle>Informações do Projeto</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setWizardOpen(true)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("border", statusColors[project.status as keyof typeof statusColors])}
                    >
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Atalho de Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <Button
                          key={status}
                          variant={project.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await projectsService.update(
                                project.id,
                                { status: status as any },
                                currentWorkspace!.id
                              );
                              if (error) throw error;
                              toast.success(`Status alterado para "${label}"`);
                              fetchProject();
                            } catch (error: any) {
                              toast.error("Erro ao alterar status");
                            }
                          }}
                          className={cn(
                            "transition-all",
                            project.status === status && statusColors[status as keyof typeof statusColors]
                          )}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
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

                  <div className="grid gap-4 md:grid-cols-2">
                    {project.type && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo de Projeto</h4>
                        <p className="text-sm">{projectTypes.find(t => t.value === project.type)?.label || project.type}</p>
                      </div>
                    )}

                    {project.location && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Localização</h4>
                        <p className="text-sm">{project.location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {project.briefing && <ProjectBriefingView briefing={project.briefing} projectStatus={project.status} />}
              
              {project.site_photos && project.site_photos.length > 0 && (
                <ProjectSitePhotosView photos={project.site_photos} />
              )}
              
              {project.moodboard && project.moodboard.length > 0 && (
                <ProjectMoodboardView items={project.moodboard} />
              )}
              
              {project.technical_files && project.technical_files.length > 0 && (
                <ProjectFilesView files={project.technical_files} />
              )}
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

            <TabsContent value="budget" className="space-y-6">
              <BudgetSummaryCards 
                totalBudget={getBudgetTotals().totalBudget}
                totalSpent={getBudgetTotals().totalSpent}
                totalQuoted={getBudgetTotals().totalQuoted}
              />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Controle detalhado de todos os custos do projeto
                  </p>
                </div>
                <div className="flex gap-2">
                  <BudgetCategoryManager
                    onCreateCategory={handleCreateCategory}
                  />
                  <Button onClick={() => {
                    setBudgetItemToEdit(null);
                    setBudgetItemDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Item
                  </Button>
                </div>
              </div>

              {budgetCategories.filter(cat => cat.is_active).length > 0 ? (
                <Accordion type="multiple" className="space-y-3">
                  {budgetCategories
                    .filter(cat => cat.is_active)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map(category => {
                      const categoryItems = budgetItems.filter(item => item.category_id === category.id);
                      return (
                        <BudgetCategorySection
                          key={category.id}
                          category={category}
                          items={categoryItems}
                          onEditItem={(item) => {
                            setBudgetItemToEdit(item);
                            setBudgetItemDialogOpen(true);
                          }}
                          onDeleteItem={handleDeleteBudgetItem}
                          onDuplicateItem={handleDuplicateBudgetItem}
                        />
                      );
                    })}
                </Accordion>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      Nenhuma categoria ativa. Crie uma categoria para começar a adicionar itens.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gantt">
              {/* Remover restrição de feature para admins */}
              {true ? (
                <ProjectSchedule
                  projectId={id!}
                  projectStartDate={project.start_date || undefined}
                  projectEndDate={project.end_date || undefined}
                />
              ) : (
                <FeatureUpgradeCard
                  title="Cronograma (Gantt)"
                  description="Visualize o cronograma do seu projeto com um gráfico Gantt interativo"
                  requiredPlan={getRequiredPlan('gantt')}
                  icon={<Calendar className="h-6 w-6" />}
                />
              )}
            </TabsContent>

            <TabsContent value="tasks">
              <KanbanBoard projectId={id!} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
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

      <BudgetItemFormDialog
        open={budgetItemDialogOpen}
        onOpenChange={(open) => {
          setBudgetItemDialogOpen(open);
          if (!open) setBudgetItemToEdit(null);
        }}
        onSubmit={budgetItemToEdit ? handleEditBudgetItem : handleCreateBudgetItem}
        categories={budgetCategories}
        areas={projectAreas}
        initialData={budgetItemToEdit ? {
          category_id: budgetItemToEdit.category_id,
          area_id: budgetItemToEdit.area_id || undefined,
          item_name: budgetItemToEdit.item_name,
          executor: budgetItemToEdit.executor || undefined,
          description: budgetItemToEdit.description || undefined,
          status: budgetItemToEdit.status as any,
          measurement_unit: budgetItemToEdit.measurement_unit || undefined,
          measurement_base: budgetItemToEdit.measurement_base?.toString() || undefined,
          measurement_purchased: budgetItemToEdit.measurement_purchased?.toString() || undefined,
          quantity: budgetItemToEdit.quantity?.toString() || undefined,
          store_name: budgetItemToEdit.store_name || undefined,
          product_code: budgetItemToEdit.product_code || undefined,
          unit_price: budgetItemToEdit.unit_price?.toString() || undefined,
          store_link: budgetItemToEdit.store_link || undefined,
          alternative_store_name: budgetItemToEdit.alternative_store_name || undefined,
          alternative_product_code: budgetItemToEdit.alternative_product_code || undefined,
          alternative_unit_price: budgetItemToEdit.alternative_unit_price?.toString() || undefined,
          alternative_store_link: budgetItemToEdit.alternative_store_link || undefined,
          selected_store: (budgetItemToEdit.selected_store as "main" | "alternative") || "main",
          deadline: budgetItemToEdit.deadline || undefined,
          notes: budgetItemToEdit.notes || undefined,
        } : undefined}
        isEditing={!!budgetItemToEdit}
      />
    </div>
  );
}

export default withWorkspaceGuard(ProjectDetails);
