import React, { useState, useEffect } from "react";
import { Bell, LogOut, Settings, Building2, Sun, Moon, Crown, Trash2 } from "lucide-react";
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

  // 1. Estado para notificações
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [previewNotification, setPreviewNotification] = useState<null | { message: string; type: string }>(null);
  const [selectedNotification, setSelectedNotification] = useState<null | typeof notifications[0]>(null);

  const base_url = "https://archestra-backend.onrender.com";

  async function fetchNotifications() {
    if (!user?.id) return;
    try {
      setLoadingNotifications(true);
      const response = await fetch(`${base_url}/notifications?user_id=${user.id}`);
      const data = await response.json();
      const newNotifications = Array.isArray(data.notifications) ? data.notifications : [];
      // Verifica se chegou uma nova não lida
      if (
        newNotifications.length > 0 &&
        (!notifications.length || newNotifications[0].id !== notifications[0]?.id)
      ) {
        setPreviewNotification({
          message: newNotifications[0].message,
          type: newNotifications[0].type,
        });
        setTimeout(() => setPreviewNotification(null), 5000); // some em 5s
      }
      setNotifications(newNotifications);
    } catch (error) {
      toast.error("Erro ao carregar notificações");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  useEffect(() => {
    function handleNewNotification() {
      fetchNotifications();
    }
    window.addEventListener("notification:new", handleNewNotification);
    return () => window.removeEventListener("notification:new", handleNewNotification);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      // Chame o endpoint do backend para marcar todas como lidas
      await fetch(`${base_url}/notifications/mark-all-read?user_id=${user.id}`, {
        method: "POST",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setTimeout(() => {
        fetchNotifications();
      }, 3000);
    } catch {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

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

  const deleteNotification = async (id: string, created_at: string) => {
    try {
      await fetch(`${base_url}/notifications?user_id=${user.id}&created_at=${encodeURIComponent(created_at)}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => !(n.id === id && n.created_at === created_at)));
    } catch {
      toast.error("Erro ao excluir notificação");
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

          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-accent text-white text-xs font-bold border-2 border-card"
                    style={{ zIndex: 10 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                Notificações
                {unreadCount > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="float-right"
                    onClick={markAllAsRead}
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Sem notificações.
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => setSelectedNotification(n)}
                    className={`
                      flex items-center gap-2 px-4 py-2 mb-1 rounded
                      bg-card
                      hover:bg-accent/10
                      transition
                      border-none
                      shadow-none
                      min-h-[44px]
                      w-full
                      cursor-pointer
                    `}
                  >
                    <Bell className="h-5 w-5 text-accent shrink-0" />
                    <span className="font-medium text-base truncate">{n.message}</span>
                    {n.created_at && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(n.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    )}
                    <button
                      className="ml-2 opacity-60 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id, n.created_at);
                      }}
                      title="Excluir notificação"
                      style={{ marginLeft: "auto" }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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

      {previewNotification && (
        <div
          className="fixed right-8 top-20 z-50 bg-card border border-accent rounded-md px-3 py-1 shadow-sm flex items-center gap-2 animate-fade-in"
          style={{ minWidth: 0, maxWidth: 320 }}
        >
          <Bell className="h-4 w-4 text-accent shrink-0" />
          <span className="font-medium text-sm truncate">{previewNotification.message}</span>
        </div>
      )}

      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-accent" />
              <span className="font-semibold text-lg">Detalhes da Notificação</span>
            </div>
            <div className="mb-2">
              <span className="font-medium">{selectedNotification.message}</span>
            </div>
            {selectedNotification.created_at && (
              <div className="text-xs text-muted-foreground mb-2">
                {new Date(selectedNotification.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedNotification(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

toast(`Projeto criado!`, {
  description: "Sua notificação foi enviada.",
  duration: 10000, // 10 segundos
});
