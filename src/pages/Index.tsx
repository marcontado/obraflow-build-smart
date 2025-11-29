import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, TrendingUp, Clock, CheckCircle2, CreditCard } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    totalBudget: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    // Debug logs
    console.log("🔍 Dashboard Debug:", {
      hasUser: !!user,
      hasSession: !!session,
      hasWorkspace: !!currentWorkspace,
      workspaceId: currentWorkspace?.id,
      workspaceName: currentWorkspace?.name,
      workspaceLoading
    });

    if (!workspaceLoading && currentWorkspace && user) {
      fetchDashboardData();
    } else if (!workspaceLoading && !currentWorkspace) {
      console.warn("⚠️ No workspace available");
      setLoading(false);
    }
  }, [currentWorkspace, user, session, workspaceLoading]);

  const fetchDashboardData = async () => {
    if (!currentWorkspace) {
      console.error("❌ fetchDashboardData called without currentWorkspace");
      return;
    }

    if (!user || !session) {
      console.error("❌ fetchDashboardData called without authentication");
      toast.error("Você precisa estar autenticado para visualizar os dados");
      return;
    }
    
    if (isFirstMount.current) {
      setLoading(true);
    }
    
    try {
      console.log("🔄 Fetching projects for workspace:", currentWorkspace.id);

      // Query usando a foreign key específica para evitar ambiguidade
      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients!projects_client_id_fkey (name)
        `)
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ Projects fetched successfully:", projects?.length || 0);

      const totalProjects = projects?.length || 0;
      const inProgress = projects?.filter((p) => p.status === "in_progress").length || 0;
      const completed = projects?.filter((p) => p.status === "completed").length || 0;
      const totalBudget = projects?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;

      setStats({ totalProjects, inProgress, completed, totalBudget });
      setRecentProjects(projects || []);
    } catch (error: any) {
      console.error("❌ Dashboard error:", error);
      
      // Mensagens de erro mais específicas
      if (error.message?.includes("row-level security")) {
        toast.error("Você não tem permissão para visualizar projetos deste workspace");
      } else if (error.message?.includes("JWT")) {
        toast.error("Sessão expirada. Por favor, faça login novamente");
      } else {
        toast.error("Erro ao carregar dados do dashboard");
      }
    } finally {
      setLoading(false);
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
  };

  // Loading state para workspace
  if (workspaceLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            title="Dashboard"
            subtitle="Visão geral dos seus projetos e métricas"
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="text-muted-foreground">Carregando workspace...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Estado quando não há workspace
  if (!currentWorkspace) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            title="Dashboard"
            subtitle="Visão geral dos seus projetos e métricas"
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum workspace disponível</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Você precisa criar ou ser convidado para um workspace
              </p>
              <button
                onClick={() => navigate("/app/workspace/new")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Workspace
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Visão geral dos seus projetos e métricas"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total de Projetos"
                  value={stats.totalProjects}
                  icon={FolderKanban}
                  description="Todos os seus projetos"
                />
                <StatsCard
                  title="Em Andamento"
                  value={stats.inProgress}
                  icon={Clock}
                  description="Projetos ativos"
                />
                <StatsCard
                  title="Concluídos"
                  value={stats.completed}
                  icon={CheckCircle2}
                  description="Projetos finalizados"
                />
                <StatsCard
                  title="Orçamento Total"
                  value={`R$ ${stats.totalBudget.toLocaleString()}`}
                  icon={TrendingUp}
                  description="Soma de todos os orçamentos"
                />
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Projetos Recentes</h3>
                <button
                  onClick={() => navigate("/app/projects")}
                  className="text-sm text-primary hover:underline"
                >
                  Ver todos
                </button>
              </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum projeto ainda</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Comece criando seu primeiro projeto
              </p>
              <button
                onClick={() => navigate("/app/projects")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Projeto
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
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
    </div>
  );
}

export default Index;
