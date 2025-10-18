import { useEffect, useState } from "react";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MembersListProps {
  workspaceId: string;
}

export function MembersList({ workspaceId }: MembersListProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

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
        <div className="space-y-4">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.profiles?.full_name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                </div>
              </div>
              <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
