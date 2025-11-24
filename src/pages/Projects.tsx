import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectWizard } from "@/components/projects/wizard/ProjectWizard";
import ContratoModal from "@/components/projects/ContratoModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { projectsService } from "@/services/projects.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { toast } from "sonner";

function Projects() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const [formOpen, setFormOpen] = useState(false);
  const [contratoModalOpen, setContratoModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      toast.error("Erro ao carregar projetos");
      console.error(error);
    } finally {
      setLoading(false);
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
  };

  const getFilteredProjects = (tab: "active" | "completed") => {
    let filtered = projects;
    
    // Filter by tab (active/completed)
    if (tab === "completed") {
      filtered = filtered.filter(p => p.status === "completed");
    } else {
      // Active projects: planning, in_progress, on_hold
      filtered = filtered.filter(p => p.status !== "completed");
      
      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
    }
    
    // Filter by search query (name or client)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.clients?.name && p.clients.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const activeProjects = getFilteredProjects("active");
  const completedProjects = getFilteredProjects("completed");

  const statusLabels: Record<string, string> = {
    all: "Todos",
    planning: "Planejamento",
    in_progress: "Em Andamento",
    on_hold: "Em Pausa"
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Projetos"
          subtitle="Gerencie todos os seus projetos de design de interiores"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Meus Projetos</h3>
                <p className="text-sm text-muted-foreground">
                  {projects.length} projeto(s) no total
                </p>
              </div>
              <Button onClick={() => setFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do projeto ou cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="gap-2">
                Projetos Ativos
                <Badge variant="secondary">{activeProjects.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                Concluídos
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
                      ? "Nenhum projeto ativo encontrado" 
                      : `Nenhum projeto ${statusLabels[statusFilter].toLowerCase()} encontrado`}
                  </p>
                  <Button onClick={() => setFormOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Projeto
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
                    Nenhum projeto concluído ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Os projetos marcados como concluídos aparecerão aqui
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
