import { Bell, LogOut, Settings, Building2, Sun, Moon, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PLAN_NAMES } from "@/constants/plans";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const roleColors = {
  owner: "bg-primary text-primary-foreground",
  admin: "bg-accent text-accent-foreground",
  member: "bg-secondary text-secondary-foreground",
};

const roleLabels = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
};

const planColors: Record<string, string> = {
  atelier: "bg-secondary text-secondary-foreground",
  studio: "bg-primary text-primary-foreground",
  domus: "bg-accent text-accent-foreground",
};

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { role } = useUserRole();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada com sucesso");
    } catch (error) {
      toast.error("Erro ao sair");
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {currentWorkspace && (
            <Badge 
              className={cn("cursor-pointer", planColors[currentWorkspace.subscription_plan])}
              onClick={() => navigate('/app/plan-upgrade')}
            >
              <Crown className="h-3 w-3 mr-1" />
              {PLAN_NAMES[currentWorkspace.subscription_plan as keyof typeof PLAN_NAMES]}
            </Badge>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative"
            title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">Minha Conta</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {role && (
                    <Badge className={roleColors[role]} variant="secondary">
                      {roleLabels[role]}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              {currentWorkspace && (
                <DropdownMenuItem onClick={() => navigate(`/workspace/${currentWorkspace.id}/settings`)} className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Workspace</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
