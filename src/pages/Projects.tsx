import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectWizard } from "@/components/projects/wizard/ProjectWizard";
import ContratoModal from "@/components/projects/ContratoModal";
import { Button } from "@/components/ui/button";
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
  const [formOpen, setFormOpen] = useState(false);
  const [contratoModalOpen, setContratoModalOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects();
    }
  }, [currentWorkspace]);

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    
    try {
      const { data, error } = await projectsService.getAll(currentWorkspace.id);
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar projetos");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Todos os Projetos</h3>
              <p className="text-sm text-muted-foreground">
                {projects.length} projeto(s) no total
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum projeto encontrado
              </p>
              <Button onClick={() => setFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Projeto
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
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
