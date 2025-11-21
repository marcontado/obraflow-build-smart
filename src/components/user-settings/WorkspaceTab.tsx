import { useState } from "react";
import { Building2, Users, Crown, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserRole } from "@/hooks/useUserRole";
import { InviteModal } from "@/components/workspaces/InviteModal";
import { useNavigate } from "react-router-dom";

const roleInfo = {
  owner: {
    label: "Proprietário",
    description: "Acesso completo, incluindo gerenciamento de membros, projetos e configurações. Pode deletar o workspace.",
    icon: Crown,
    color: "bg-primary text-primary-foreground",
  },
  admin: {
    label: "Administrador",
    description: "Pode gerenciar membros, projetos e a maioria das configurações do workspace.",
    icon: Shield,
    color: "bg-accent text-accent-foreground",
  },
  member: {
    label: "Membro",
    description: "Pode visualizar e editar projetos, mas não pode gerenciar configurações ou membros.",
    icon: UserIcon,
    color: "bg-secondary text-secondary-foreground",
  },
};

export function WorkspaceTab() {
  const { currentWorkspace } = useWorkspace();
  const { role, loading, isOwner, isAdmin } = useUserRole();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum Workspace Selecionado
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione ou crie um workspace para continuar
        </p>
        <Button onClick={() => navigate("/workspace/select")}>
          Selecionar Workspace
        </Button>
      </div>
    );
  }

  const currentRole = role ? roleInfo[role] : null;
  const RoleIcon = currentRole?.icon || UserIcon;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Workspace Atual</h3>
        <p className="text-sm text-muted-foreground">
          Informações sobre seu workspace e permissões
        </p>
      </div>

      {/* Workspace Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentWorkspace.logo_url || ""} alt={currentWorkspace.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-xl font-semibold text-foreground">{currentWorkspace.name}</h4>
              <p className="text-sm text-muted-foreground">@{currentWorkspace.slug}</p>
              <Badge variant="secondary" className="mt-2">
                Plano: {currentWorkspace.subscription_plan}
              </Badge>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <Button
              variant="outline"
              onClick={() => navigate(`/workspace/${currentWorkspace.id}/settings`)}
            >
              Configurações
            </Button>
          )}
        </div>
      </div>

      {/* User Role Info */}
      {currentRole && (
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-3 ${currentRole.color}`}>
              <RoleIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">Sua Função</h4>
                <Badge className={currentRole.color}>
                  {currentRole.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentRole.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {(isOwner || isAdmin) && (
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="w-full"
            variant="default"
          >
            <Users className="mr-2 h-4 w-4" />
            Convidar Membros para o Workspace
          </Button>
        )}
        
        <Button
          onClick={() => navigate("/workspace/select")}
          className="w-full"
          variant="outline"
        >
          <Building2 className="mr-2 h-4 w-4" />
          Trocar de Workspace
        </Button>
      </div>

      {currentWorkspace && (
        <InviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSuccess={() => setInviteModalOpen(false)}
          workspaceId={currentWorkspace.id}
        />
      )}
    </div>
  );
}
