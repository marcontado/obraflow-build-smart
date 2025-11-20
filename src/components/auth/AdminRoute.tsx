import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { adminAuthService } from "@/services/admin-auth.service";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  // Verificar token admin
  const token = adminAuthService.getAdminToken();
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Validar token
  const tokenData = adminAuthService.verifyToken(token);
  if (!tokenData) {
    adminAuthService.clearAdminToken();
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session_timestamp');
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar sessão
  const hasAdminSession = sessionStorage.getItem('admin_session') === 'true';
  const sessionTimestamp = sessionStorage.getItem('admin_session_timestamp');
  
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  const isSessionValid = sessionTimestamp && 
    (Date.now() - parseInt(sessionTimestamp)) < SESSION_TIMEOUT;

  if (!hasAdminSession || !isSessionValid) {
    adminAuthService.clearAdminToken();
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session_timestamp');
    return <Navigate to="/admin/login" replace />;
  }

  // Atualizar timestamp
  sessionStorage.setItem('admin_session_timestamp', Date.now().toString());

  return <>{children}</>;
}
