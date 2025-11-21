import { Bell, LogOut, Settings, Users, Building2 } from "lucide-react";
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
import { WorkspaceSelector } from "@/components/workspaces/WorkspaceSelector";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { InviteModal } from "@/components/workspaces/InviteModal";

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

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { role, isOwner, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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
          <WorkspaceSelector />

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
              {(isOwner || isAdmin) && (
                <DropdownMenuItem onClick={() => setInviteModalOpen(true)} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Convidar Membros</span>
                </DropdownMenuItem>
              )}
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

      {currentWorkspace && (
        <InviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSuccess={() => setInviteModalOpen(false)}
          workspaceId={currentWorkspace.id}
        />
      )}
    </header>
  );
}
