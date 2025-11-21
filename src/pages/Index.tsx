import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";

const Index = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const { t } = useTranslation('dashboard');
  const { currencySymbol, numberFormat } = useLocale();
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    totalBudget: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchDashboardData();
    }
  }, [currentWorkspace]);

  const fetchDashboardData = async () => {
    if (!currentWorkspace) return;
    
    if (isFirstMount.current) {
      setLoading(true);
    }
    
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients (name)
        `)
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      const totalProjects = projects?.length || 0;
      const inProgress = projects?.filter((p) => p.status === "in_progress").length || 0;
      const completed = projects?.filter((p) => p.status === "completed").length || 0;
      const totalBudget = projects?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;

      setStats({ totalProjects, inProgress, completed, totalBudget });
      setRecentProjects(projects || []);
    } catch (error: any) {
      toast.error(t('error'));
      console.error(error);
    } finally {
      setLoading(false);
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
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
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t('stats.totalProjects.title')}
              value={stats.totalProjects}
              icon={FolderKanban}
              description={t('stats.totalProjects.description')}
            />
            <StatsCard
              title={t('stats.inProgress.title')}
              value={stats.inProgress}
              icon={Clock}
              description={t('stats.inProgress.description')}
            />
            <StatsCard
              title={t('stats.completed.title')}
              value={stats.completed}
              icon={CheckCircle2}
              description={t('stats.completed.description')}
            />
            <StatsCard
              title={t('stats.totalBudget.title')}
              value={`${currencySymbol} ${numberFormat.format(stats.totalBudget)}`}
              icon={TrendingUp}
              description={t('stats.totalBudget.description')}
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('recentProjects.title')}</h3>
            <button
              onClick={() => navigate("/app/projects")}
              className="text-sm text-primary hover:underline"
            >
              {t('recentProjects.viewAll')}
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
              <h3 className="mb-2 text-lg font-semibold">{t('recentProjects.empty.title')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('recentProjects.empty.description')}
              </p>
              <button
                onClick={() => navigate("/app/projects")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t('recentProjects.empty.button')}
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
