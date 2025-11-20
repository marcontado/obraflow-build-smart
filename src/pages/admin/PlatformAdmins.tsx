import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus, Shield } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AddAdminDialog } from "@/components/admin/AddAdminDialog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PlatformAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; adminId: string | null }>({
    open: false,
    adminId: null,
  });
  const { permissions, isSuperAdmin } = useAdminPermissions();

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    try {
      setLoading(true);
      const data = await adminService.getPlatformAdmins();
      setAdmins(data.admins || []);
    } catch (error: any) {
      console.error("Erro ao carregar admins:", error);
      toast.error("Erro ao carregar administradores");
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await adminService.removePlatformAdmin(userId);
      toast.success("Administrador removido com sucesso");
      loadAdmins();
    } catch (error: any) {
      console.error("Erro ao remover admin:", error);
      toast.error(error.message || "Erro ao remover administrador");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updatePlatformAdminRole(userId, newRole);
      toast.success("Role atualizada com sucesso");
      loadAdmins();
    } catch (error: any) {
      console.error("Erro ao atualizar role:", error);
      toast.error(error.message || "Erro ao atualizar role");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      super_admin: { variant: "default", label: "Super Admin" },
      support: { variant: "secondary", label: "Suporte" },
      analyst: { variant: "outline", label: "Analista" },
    };
    const config = variants[role] || variants.analyst;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!permissions.canViewAdmins) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administradores da Plataforma</h1>
            <p className="text-muted-foreground">
              Gerencie quem tem acesso ao painel administrativo
            </p>
          </div>
          {permissions.canManageAdmins && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Admin
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Concedido em</TableHead>
                  <TableHead>Concedido por</TableHead>
                  {permissions.canManageAdmins && <TableHead className="w-[70px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum administrador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.profile?.full_name || "—"}
                      </TableCell>
                      <TableCell>{admin.profile?.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        {format(new Date(admin.granted_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {admin.granter?.full_name || admin.granter?.email || "Sistema"}
                      </TableCell>
                      {permissions.canManageAdmins && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(admin.user_id, "analyst")}
                                disabled={admin.role === "analyst"}
                              >
                                Tornar Analista
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(admin.user_id, "support")}
                                disabled={admin.role === "support"}
                              >
                                Tornar Suporte
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(admin.user_id, "super_admin")}
                                disabled={admin.role === "super_admin"}
                              >
                                Tornar Super Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({ open: true, adminId: admin.user_id })
                                }
                              >
                                Remover Acesso
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddAdminDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdminAdded={loadAdmins}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, adminId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Administrador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso de administrador deste usuário?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.adminId) {
                  handleRemoveAdmin(deleteDialog.adminId);
                }
                setDeleteDialog({ open: false, adminId: null });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
