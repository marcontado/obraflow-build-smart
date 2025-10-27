import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasWorkspaces, loading: workspaceLoading } = useWorkspace();
  const location = useLocation();

  // Rotas que não precisam de workspace
  const workspaceRoutes = ["/workspace/", "/onboarding"];
  const isWorkspaceRoute = workspaceRoutes.some(route => location.pathname.startsWith(route));

  if (authLoading || workspaceLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se não tem workspace e não está numa rota de workspace, redirecionar para onboarding
  if (!hasWorkspaces() && !isWorkspaceRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
