import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
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

  // Verificar se tem sessão admin ativa
  const hasAdminSession = sessionStorage.getItem('admin_session') === 'true';
  const sessionTimestamp = sessionStorage.getItem('admin_session_timestamp');
  
  // Verificar timeout da sessão (30 minutos)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em ms
  const isSessionValid = sessionTimestamp && 
    (Date.now() - parseInt(sessionTimestamp)) < SESSION_TIMEOUT;

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se é admin mas não tem sessão válida, redirecionar para login
  if (!hasAdminSession || !isSessionValid) {
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session_timestamp');
    return <Navigate to="/admin/login" replace />;
  }

  // Atualizar timestamp a cada acesso
  sessionStorage.setItem('admin_session_timestamp', Date.now().toString());

  return <>{children}</>;
}
