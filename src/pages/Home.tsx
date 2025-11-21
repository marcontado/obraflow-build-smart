import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import Landing from "./Landing";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { hasWorkspaces, loading: workspaceLoading } = useWorkspace();

  // Show loading while checking auth
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to app
  if (user) {
    // If no workspaces, go to workspace selection
    if (!hasWorkspaces()) {
      return <Navigate to="/workspace/select" replace />;
    }
    // Otherwise go to main app
    return <Navigate to="/app" replace />;
  }

  // If not authenticated, show landing page
  return <Landing />;
}

