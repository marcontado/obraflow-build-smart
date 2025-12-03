import { Home, FolderKanban, Users, BarChart3, LogOut, Lock, Handshake, MessageCircle, FileText, DollarSign, Zap } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/constants/plans";

const navigation = [
  { name: "Dashboard", href: "/app", icon: Home },
  { name: "Projetos", href: "/app/projects", icon: FolderKanban },
  { name: "Clientes", href: "/app/clients", icon: Users },
  { name: "Fornecedores", href: "/app/partners", icon: Handshake, feature: "partners" as const },
  { name: "Relatórios", href: "/app/reports", icon: BarChart3, feature: "reports" as const },
  { name: "Financeiro", href: "/app/financeiro", icon: DollarSign, alwaysLocked: true },
  { name: "Templates de Documentos", href: "/app/templates", icon: FileText, feature: "templates" as const },
  { name: "Chat IA", href: "/app/chat", icon: Zap }, 
  { name: "Suporte", href: "/app/suporte", icon: MessageCircle },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { hasFeature } = useFeatureAccess();
  const { currentWorkspace } = useWorkspace();

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
            const isLocked = item.alwaysLocked || (item.feature && !hasFeature(item.feature));

            if (isLocked) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer",
                        "text-muted-foreground/50"
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      <Lock className="h-3 w-3 flex-shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {item.alwaysLocked 
                        ? "Em desenvolvimento" 
                        : "Disponível nos planos Studio e Domus"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/app"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
              </NavLink>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t p-3 space-y-2">
        {currentWorkspace?.subscription_plan === SUBSCRIPTION_PLANS.ATELIER && (
          <Button
            onClick={() => navigate('/app/plan-upgrade')}
            className="w-full"
            variant="default"
          >
            <Zap className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
