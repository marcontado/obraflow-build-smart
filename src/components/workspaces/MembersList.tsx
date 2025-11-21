import { useEffect, useState } from "react";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Users, Crown, Shield, User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PLAN_LIMITS } from "@/constants/plans";
import { InviteModal } from "@/components/workspaces/InviteModal";
import { format } from "date-fns";

interface MembersListProps {
  workspaceId: string;
}

export function MembersList({ workspaceId }: MembersListProps) {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchMembers();
    getCurrentUser();
  }, [workspaceId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchMembers = async () => {
    const { data, error } = await workspacesService.getMembers(workspaceId);

    if (error) {
      toast({
        title: "Erro ao carregar membros",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMembers(data || []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await workspacesService.updateMemberRole(workspaceId, userId, newRole);

    if (error) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Permissão atualizada",
      description: "A permissão do membro foi alterada com sucesso.",
    });

    fetchMembers();
  };

  const handleRemoveMember = async (userId: string) => {
    const ownerCount = members.filter(m => m.role === "owner").length;
    const isLastOwner = ownerCount === 1 && members.find(m => m.user_id === userId)?.role === "owner";

    if (isLastOwner) {
      toast({
        title: "Não é possível remover",
        description: "Você não pode remover o último owner do workspace.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await workspacesService.removeMember(workspaceId, userId);

    if (error) {
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Membro removido",
      description: "O membro foi removido do workspace com sucesso.",
    });

    fetchMembers();
  };

  const currentUserMember = members.find(m => m.user_id === currentUserId);
  const canManageMembers = currentUserMember?.role === "owner" || currentUserMember?.role === "admin";
  const maxMembers = currentWorkspace ? PLAN_LIMITS[currentWorkspace.subscription_plan].membersPerWorkspace : Infinity;
  const canInvite = canManageMembers && members.length < maxMembers;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Legend */}
      <Card className="mx-6 mt-6">
        <CardHeader>
          <CardTitle className="text-base">Permissões por Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Badge variant="default" className="gap-1">
                <Crown className="h-3 w-3" /> Owner
              </Badge>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Deletar workspace</li>
                <li>✓ Transferir ownership</li>
                <li>✓ Gerenciar plano e billing</li>
                <li>✓ Todas as permissões</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" /> Admin
              </Badge>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Gerenciar membros</li>
                <li>✓ Gerenciar projetos</li>
                <li>✓ Configurações gerais</li>
                <li>✗ Não pode remover owners</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" /> Member
              </Badge>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Ver projetos</li>
                <li>✓ Editar tarefas atribuídas</li>
                <li>✗ Sem acesso a configurações</li>
                <li>✗ Não pode gerenciar membros</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Header */}
      <div className="flex items-center justify-between px-6">
        <div>
          <h3 className="text-lg font-semibold">Membros do Workspace</h3>
          <p className="text-sm text-muted-foreground">
            {members.length} de {maxMembers === Infinity ? '∞' : maxMembers} membros
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setShowInviteModal(true)} disabled={!canInvite}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Membro
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="px-6 pb-6">
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum membro"
            description="Este workspace ainda não possui membros. Convide pessoas para colaborar."
          />
        ) : (
          <div className="space-y-3">
            {members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="flex flex-1 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback>
                      {member.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.profiles?.full_name || "Usuário"}
                      </p>
                      {member.user_id === currentUserId && (
                        <Badge variant="outline" className="text-xs">Você</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{member.profiles?.email}</span>
                      <span>•</span>
                      <span>Entrou em {format(new Date(member.joined_at), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canManageMembers && member.user_id !== currentUserId ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.user_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              Membro
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="owner">
                            <div className="flex items-center gap-2">
                              <Crown className="h-3 w-3" />
                              Owner
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação vai remover {member.profiles?.full_name || "este membro"} do workspace.
                              Eles perderão acesso a todos os projetos e dados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Badge variant={getRoleVariant(member.role)} className="gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canManageMembers && (
        <InviteModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={fetchMembers}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}
