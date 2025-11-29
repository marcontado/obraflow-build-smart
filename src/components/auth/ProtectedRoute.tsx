import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasWorkspaces, currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscriptionStatus();
  const location = useLocation();

  // Rotas que não precisam de workspace ou verificação de assinatura
  const workspaceRoutes = ["/workspace/", "/onboarding"];
  const subscriptionExemptRoutes = ["/app/pending-payment", "/subscription/", "/onboarding"];
  const isWorkspaceRoute = workspaceRoutes.some(route => location.pathname.startsWith(route));
  const isSubscriptionExempt = subscriptionExemptRoutes.some(route => location.pathname.startsWith(route));

  if (authLoading || workspaceLoading || subscriptionLoading) {
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

  // Se tem workspace mas não tem assinatura ativa e não está em rota isenta, redirecionar para pending-payment
  if (currentWorkspace && !hasActiveSubscription && !isSubscriptionExempt) {
    return <Navigate to="/app/pending-payment" replace />;
  }

  return <>{children}</>;
}
