import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectWizard } from "@/components/projects/wizard/ProjectWizard";
import ContratoModal from "@/components/projects/ContratoModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { projectsService } from "@/services/projects.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function Projects() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const [formOpen, setFormOpen] = useState(false);
  const [contratoModalOpen, setContratoModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { t } = useTranslation('projects');

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects();
    }
  }, [currentWorkspace]);

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    
    if (isFirstMount.current) {
      setLoading(true);
    }
    
    try {
      const { data, error } = await projectsService.getAll(currentWorkspace.id);
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error(t('errors.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
  };

  const getFilteredProjects = (tab: "active" | "completed") => {
    if (tab === "completed") {
      return projects.filter(p => p.status === "completed");
    }
    
    const activeProjects = projects.filter(p => p.status !== "completed");
    
    if (statusFilter === "all") {
      return activeProjects;
    }
    
    return activeProjects.filter(p => p.status === statusFilter);
  };

  const activeProjects = getFilteredProjects("active");
  const completedProjects = getFilteredProjects("completed");

  const statusLabels: Record<string, string> = {
    all: t('filters.all'),
    planning: t('status.planning'),
    in_progress: t('status.inProgress'),
    on_hold: t('status.onHold')
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('myProjects')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('totalCount', { count: projects.length })}
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('actions.new')}
            </Button>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="gap-2">
                {t('tabs.active')}
                <Badge variant="secondary">{activeProjects.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                {t('tabs.completed')}
                <Badge variant="secondary">{completedProjects.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Button
                    key={value}
                    variant={statusFilter === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    {statusFilter === "all" 
                      ? t('empty.noActive')
                      : t('empty.noFiltered', { status: statusLabels[statusFilter].toLowerCase() })}
                  </p>
                  <Button onClick={() => setFormOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('empty.createFirst')}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      client={project.clients?.name}
                      status={project.status}
                      progress={project.progress}
                      budget={project.budget}
                      spent={project.spent}
                      startDate={project.start_date}
                      endDate={project.end_date}
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : completedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    {t('empty.noCompleted')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('empty.completedWillAppear')}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      client={project.clients?.name}
                      status={project.status}
                      progress={project.progress}
                      budget={project.budget}
                      spent={project.spent}
                      startDate={project.start_date}
                      endDate={project.end_date}
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ProjectWizard
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchProjects}
      />
      <ContratoModal
        isOpen={contratoModalOpen}
        onClose={() => setContratoModalOpen(false)}
      />
    </div>
  );
}

export default withWorkspaceGuard(Projects);
