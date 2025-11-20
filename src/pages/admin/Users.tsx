import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, RefreshCw, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChangePlanDialog } from "@/components/admin/ChangePlanDialog";
import { PLAN_NAMES } from "@/constants/plans";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changePlanDialog, setChangePlanDialog] = useState<{
    open: boolean;
    workspaceId: string;
    workspaceName: string;
    currentPlan: string;
  }>({
    open: false,
    workspaceId: "",
    workspaceName: "",
    currentPlan: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search: search || undefined,
      });
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleChangePlan = (workspaceId: string, workspaceName: string, currentPlan: string) => {
    setChangePlanDialog({
      open: true,
      workspaceId,
      workspaceName,
      currentPlan,
    });
  };

  const handleClosePlanDialog = () => {
    setChangePlanDialog({
      open: false,
      workspaceId: "",
      workspaceName: "",
      currentPlan: "",
    });
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      atelier: "secondary",
      studio: "default",
      domus: "default",
    };
    
    return (
      <Badge variant={variants[plan] || "outline"}>
        {PLAN_NAMES[plan as keyof typeof PLAN_NAMES] || plan}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">Gerenciar usuários da plataforma</p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || "Sem nome"}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role || "designer"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {user.workspaces?.map((ws: any) => (
                          <div key={ws.id} className="flex items-center gap-2">
                            <span className="text-xs flex-1">{ws.name}</span>
                            {getPlanBadge(ws.subscription_plan)}
                          </div>
                        )) || <span className="text-xs text-muted-foreground">Nenhum</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.workspaces && user.workspaces.length > 0 ? (
                        <div className="flex flex-col gap-1 items-end">
                          {user.workspaces.map((ws: any) => (
                            <Button
                              key={ws.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangePlan(ws.id, ws.name, ws.subscription_plan)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Gerenciar
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ChangePlanDialog
          open={changePlanDialog.open}
          onClose={handleClosePlanDialog}
          onSuccess={loadUsers}
          workspaceId={changePlanDialog.workspaceId}
          workspaceName={changePlanDialog.workspaceName}
          currentPlan={changePlanDialog.currentPlan}
        />
      </div>
    </AdminLayout>
  );
}
