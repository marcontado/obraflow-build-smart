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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Settings, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChangePlanDialog } from "@/components/admin/ChangePlanDialog";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

export default function AdminOrganizations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permissions } = useAdminPermissions();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    workspaceId: string;
    workspaceName: string;
  }>({
    open: false,
    workspaceId: "",
    workspaceName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, [planFilter]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrganizations({
        plan: planFilter && planFilter !== 'all' ? planFilter : undefined,
        search: search || undefined,
      });
      setOrganizations(data.organizations || []);
    } catch (error: any) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Erro ao carregar organizações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadOrganizations();
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await adminService.deleteWorkspace(deleteDialog.workspaceId);
      toast({
        title: "Workspace deletado",
        description: "O workspace foi removido com sucesso.",
      });
      setDeleteDialog({ open: false, workspaceId: "", workspaceName: "" });
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar workspace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      atelier: "secondary",
      studio: "default",
      domus: "default",
    };
    
    return (
      <Badge variant={variants[plan] || "outline"}>
        {plan === 'atelier' ? 'Atelier' : plan === 'studio' ? 'Studio' : 'Domus'}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizações</h1>
            <p className="text-muted-foreground">Gerenciar workspaces cadastrados</p>
          </div>
          <Button onClick={loadOrganizations} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os planos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="atelier">Atelier</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="domus">Domus</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead>Projetos</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma organização encontrada
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                    <TableCell>{getPlanBadge(org.subscription_plan)}</TableCell>
                    <TableCell>{org.memberCount || 0}</TableCell>
                    <TableCell>{org.projectCount || 0}</TableCell>
                    <TableCell>
                      {format(new Date(org.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {org.subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/organizations/${org.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        {permissions.canEditOrganizationPlan && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setChangePlanDialog({
                                open: true,
                                workspaceId: org.id,
                                workspaceName: org.name,
                                currentPlan: org.subscription_plan,
                              })
                            }
                            title="Alterar plano"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        {permissions.canManageAdmins && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                workspaceId: org.id,
                                workspaceName: org.name,
                              })
                            }
                            title="Deletar workspace"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ChangePlanDialog
          open={changePlanDialog.open}
          onClose={() =>
            setChangePlanDialog({
              open: false,
              workspaceId: "",
              workspaceName: "",
              currentPlan: "",
            })
          }
          onSuccess={loadOrganizations}
          workspaceId={changePlanDialog.workspaceId}
          workspaceName={changePlanDialog.workspaceName}
          currentPlan={changePlanDialog.currentPlan}
        />

        <DeleteConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, workspaceId: "", workspaceName: "" })}
          onConfirm={handleDeleteWorkspace}
          title="Deletar Workspace"
          description={`Tem certeza que deseja deletar o workspace "${deleteDialog.workspaceName}"? Esta ação é irreversível e todos os dados relacionados serão permanentemente removidos.`}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}