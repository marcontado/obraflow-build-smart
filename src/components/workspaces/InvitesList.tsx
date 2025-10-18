import { useEffect, useState } from "react";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { InviteModal } from "./InviteModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Copy, Trash2 } from "lucide-react";

interface InvitesListProps {
  workspaceId: string;
}

export function InvitesList({ workspaceId }: InvitesListProps) {
  const { toast } = useToast();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, [workspaceId]);

  const fetchInvites = async () => {
    const { data, error } = await workspacesService.getInvites(workspaceId);

    if (error) {
      toast({
        title: "Erro ao carregar convites",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInvites(data || []);
    setLoading(false);
  };

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado!",
      description: "O link de convite foi copiado para a área de transferência.",
    });
  };

  const handleCancelInvite = async (inviteId: string) => {
    const { error } = await workspacesService.cancelInvite(inviteId);

    if (error) {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Convite cancelado",
      description: "O convite foi removido com sucesso.",
    });

    fetchInvites();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>
                {invites.length} {invites.length === 1 ? "convite" : "convites"}
              </CardDescription>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Convite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum convite pendente</p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite: any) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{invite.role}</Badge>
                      <span>
                        Expira em {new Date(invite.expires_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyLink(invite.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InviteModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchInvites}
        workspaceId={workspaceId}
      />
    </>
  );
}
