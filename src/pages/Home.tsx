import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTranslation } from "react-i18next";
import Landing from "./Landing";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { hasWorkspaces, loading: workspaceLoading } = useWorkspace();
  const { t } = useTranslation('dashboard');

  if (authLoading || workspaceLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (!hasWorkspaces()) {
      return <Navigate to="/workspace/select" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <Landing />;
}
