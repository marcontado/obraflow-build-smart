import { useEffect, useState } from "react";
import { Activity, FileText, Users, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";

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
  const { t } = useTranslation('settings');
  const { dateLocale } = useLocale();

  useEffect(() => {
    if (user?.id && currentWorkspace?.id) {
      fetchActivities();
    }
  }, [user?.id, currentWorkspace?.id]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, created_at")
        .eq("created_by", user?.id)
        .eq("workspace_id", currentWorkspace?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .eq("created_by", user?.id)
        .eq("workspace_id", currentWorkspace?.id)
        .order("created_at", { ascending: false })
        .limit(5);

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
          action: t('activity.actions.createdProject', { name: project.name }),
          timestamp: project.created_at,
          icon: FolderOpen,
        });
      });

      clients?.forEach((client) => {
        allActivities.push({
          id: client.id,
          type: "client",
          action: t('activity.actions.addedClient', { name: client.name }),
          timestamp: client.created_at,
          icon: Users,
        });
      });

      tasks?.forEach((task) => {
        allActivities.push({
          id: task.id,
          type: "task",
          action: t('activity.actions.createdTask', { name: task.title }),
          timestamp: task.created_at,
          icon: FileText,
        });
      });

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
        <div className="text-center text-muted-foreground">{t('activity.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t('activity.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('activity.description')}
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('activity.empty.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('activity.empty.description')}
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
                    {new Date(activity.timestamp).toLocaleString(dateLocale as any, {
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
