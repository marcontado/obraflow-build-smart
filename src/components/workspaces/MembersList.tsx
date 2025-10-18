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
import { Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";

interface MembersListProps {
  workspaceId: string;
}

export function MembersList({ workspaceId }: MembersListProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros do Workspace</CardTitle>
        <CardDescription>
          {members.length} {members.length === 1 ? "membro" : "membros"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum membro"
            description="Este workspace ainda não possui membros. Convide pessoas para colaborar."
          />
        ) : (
          <div className="space-y-4">
            {members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback>
                      {member.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.full_name || "Usuário"}
                      {member.user_id === currentUserId && (
                        <Badge variant="outline" className="ml-2">Você</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
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
                          <SelectItem value="member">Membro</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
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
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
