import { Home, FolderKanban, Users, BarChart3, LogOut, Lock, Handshake, MessageCircle } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/app", icon: Home },
  { name: "Projetos", href: "/app/projects", icon: FolderKanban },
  { name: "Clientes", href: "/app/clients", icon: Users },
  { name: "Relatórios", href: "/app/reports", icon: BarChart3 },
  { name: "Fornecedores", href: "/app?tab=partners", icon: Handshake },
  { name: "Suporte", href: "/app?tab=suporte", icon: MessageCircle },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasFeature } = useFeatureAccess();
  
  const currentTab = new URLSearchParams(location.search).get("tab");
  const currentPath = location.pathname;

  const handleLogout = async () => {
    const { error } = await authService.signOut();
    if (error) {
      toast.error("Erro ao fazer logout");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold text-primary">Archestra</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <TooltipProvider>
          {navigation.map((item) => {
            const isReportsPage = item.href === "/app/reports";
            const isLocked = isReportsPage && !hasFeature('reports');

            if (isLocked) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        "text-muted-foreground/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                      <Lock className="h-3 w-3 ml-auto" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível no plano Studio</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Determina se o item está ativo considerando pathname e query params
            const isItemActive = () => {
              // Para Fornecedores e Suporte, verificar se a tab está ativa
              if (item.href.includes("?tab=partners")) {
                return currentPath === "/app" && currentTab === "partners";
              }
              if (item.href.includes("?tab=suporte")) {
                return currentPath === "/app" && currentTab === "suporte";
              }
              // Para Dashboard, verificar se está em /app sem tabs
              if (item.href === "/app") {
                return currentPath === "/app" && !currentTab;
              }
              // Para outras rotas, verificar se o pathname começa com o href
              return currentPath.startsWith(item.href);
            };

            const isActive = isItemActive();

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
