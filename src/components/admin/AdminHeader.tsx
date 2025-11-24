import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminInfo } from "@/hooks/useAdminInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { User, LogOut, RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "@/services/admin-auth.service";
import { toast } from "sonner";
import { useState } from "react";

const roleLabels = {
  super_admin: "Super Admin",
  support: "Suporte",
  analyst: "Analista",
};

const roleVariants = {
  super_admin: "default" as const,
  support: "secondary" as const,
  analyst: "outline" as const,
};

export function AdminHeader() {
  const { adminInfo, loading, tokenExpiringSoon } = useAdminInfo();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    adminAuthService.clearAdminToken();
    sessionStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_session_timestamp");
    toast.success("Logout realizado com sucesso");
    navigate("/admin/login");
  };

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      await adminAuthService.refreshToken();
      toast.success("Sessão renovada com sucesso");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      toast.error("Erro ao renovar sessão. Faça login novamente.");
      handleLogout();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (!adminInfo) return null;

  const initials = adminInfo.fullName
    ? adminInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : adminInfo.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={adminInfo.avatarUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            Olá, {adminInfo.fullName || adminInfo.email}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={roleVariants[adminInfo.role as keyof typeof roleVariants] || "outline"} className="text-xs">
              {roleLabels[adminInfo.role as keyof typeof roleLabels] || adminInfo.role}
            </Badge>
            {tokenExpiringSoon && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sessão expirando
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tokenExpiringSoon && (
          <Button
            onClick={handleRefreshToken}
            disabled={refreshing}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Renovar Sessão
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={adminInfo.avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair do Painel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
