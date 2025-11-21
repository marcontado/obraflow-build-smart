import { useEffect, useState } from "react";
import { Activity, FileText, Users, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ActivityItem {
  id: string;
  type: "project" | "client" | "task" | "document";
  action: string;
  timestamp: string;
  icon: any;
}

export function ActivityTab() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && currentWorkspace?.id) {
      fetchActivities();
    }
  }, [user?.id, currentWorkspace?.id]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch recent projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, created_at")
        .eq("created_by", user?.id)
        .eq("workspace_id", currentWorkspace?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .eq("created_by", user?.id)
        .eq("workspace_id", currentWorkspace?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, created_at")
        .eq("created_by", user?.id)
        .eq("workspace_id", currentWorkspace?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const allActivities: ActivityItem[] = [];

      projects?.forEach((project) => {
        allActivities.push({
          id: project.id,
          type: "project",
          action: `Criou o projeto "${project.name}"`,
          timestamp: project.created_at,
          icon: FolderOpen,
        });
      });

      clients?.forEach((client) => {
        allActivities.push({
          id: client.id,
          type: "client",
          action: `Adicionou o cliente "${client.name}"`,
          timestamp: client.created_at,
          icon: Users,
        });
      });

      tasks?.forEach((task) => {
        allActivities.push({
          id: task.id,
          type: "task",
          action: `Criou a tarefa "${task.title}"`,
          timestamp: task.created_at,
          icon: FileText,
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center text-muted-foreground">Carregando atividades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Histórico de Atividades</h3>
        <p className="text-sm text-muted-foreground">
          Suas ações recentes no workspace
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma Atividade Recente
          </h3>
          <p className="text-sm text-muted-foreground">
            Suas atividades aparecerão aqui quando você começar a usar o sistema
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
