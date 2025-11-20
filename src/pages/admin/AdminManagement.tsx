import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Key, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type AdminRole = "super_admin" | "support" | "analyst";

interface PlatformAdmin {
  id: string;
  user_id: string;
  role: AdminRole;
  granted_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export default function AdminManagement() {
  const queryClient = useQueryClient();
  const [resetEmail, setResetEmail] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("analyst");
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);

  // Buscar lista de admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ["platform-admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_admins")
        .select("*")
        .order("granted_at", { ascending: false });

      if (error) throw error;

      // Buscar perfis separadamente
      const userIds = data.map(admin => admin.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // Combinar dados
      return data.map(admin => ({
        ...admin,
        profiles: profiles?.find(p => p.id === admin.user_id) || null,
      })) as PlatformAdmin[];
    },
  });

  // Mutation para reset de senha (novo sistema)
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('admin-auth/reset-password', {
        body: { email }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success("Email de recuperação admin enviado com sucesso!");
      setResetEmail("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao enviar email de recuperação");
    },
  });

  // Mutation para adicionar admin
  const [newAdminEmail2, setNewAdminEmail2] = useState(""); // Email admin separado
  
  const addAdminMutation = useMutation({
    mutationFn: async () => {
      // Buscar user_id pelo email do sistema
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", newAdminEmail)
        .maybeSingle();

      if (profileError) throw new Error("Erro ao buscar usuário");
      if (!profile) throw new Error("Usuário não encontrado no sistema");

      // Inserir na tabela platform_admins
      const { error: insertError } = await supabase
        .from("platform_admins")
        .insert({
          user_id: profile.id,
          role: newAdminRole,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error("Este usuário já é um administrador");
        }
        throw insertError;
      }

      // Criar credenciais admin usando edge function
      const adminEmailToUse = newAdminEmail2.trim() || newAdminEmail;
      const { data, error } = await supabase.functions.invoke('admin-create', {
        body: {
          userId: profile.id,
          adminEmail: adminEmailToUse,
          systemEmail: profile.email
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return { temporaryPassword: data.temporaryPassword, adminEmail: adminEmailToUse };
    },
    onSuccess: (data) => {
      toast.success(
        `Administrador adicionado! Senha temporária enviada por email.`,
        { duration: 10000 }
      );
      // Também mostrar a senha na UI como fallback
      console.log('Senha temporária:', data.temporaryPassword);
      toast.info(
        `Senha temporária (guarde em local seguro): ${data.temporaryPassword}`,
        { duration: 20000 }
      );
      setNewAdminEmail("");
      setNewAdminEmail2("");
      setNewAdminRole("analyst");
      queryClient.invalidateQueries({ queryKey: ["platform-admins"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar administrador");
    },
  });

  // Mutation para remover admin
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from("platform_admins")
        .delete()
        .eq("id", adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Administrador removido com sucesso!");
      setDeleteAdminId(null);
      queryClient.invalidateQueries({ queryKey: ["platform-admins"] });
    },
    onError: () => {
      toast.error("Erro ao remover administrador");
    },
  });

  const getRoleBadgeVariant = (role: AdminRole) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "support":
        return "default";
      case "analyst":
        return "secondary";
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "support":
        return "Suporte";
      case "analyst":
        return "Analista";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Administradores</h1>
          <p className="text-muted-foreground">
            Gerencie os administradores da plataforma e suas permissões
          </p>
        </div>

        {/* Reset de Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Recuperação de Senha
            </CardTitle>
            <CardDescription>
              Enviar email de redefinição de senha para um administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="reset-email">Email do Administrador</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@archestra.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => resetPasswordMutation.mutate(resetEmail)}
                  disabled={!resetEmail || resetPasswordMutation.isPending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adicionar Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Administrador
            </CardTitle>
            <CardDescription>
              Promover um usuário existente a administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="new-admin-email">Email do Sistema (usuário existente)</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email da conta no sistema principal
                </p>
              </div>
              <div>
                <Label htmlFor="new-admin-email2">Email Admin (opcional)</Label>
                <Input
                  id="new-admin-email2"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={newAdminEmail2}
                  onChange={(e) => setNewAdminEmail2(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Deixe vazio para usar o mesmo email
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="new-admin-role">Função</Label>
              <Select value={newAdminRole} onValueChange={(value: AdminRole) => setNewAdminRole(value)}>
                <SelectTrigger id="new-admin-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="support">Suporte</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">ℹ️ Como funciona:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>O usuário deve estar cadastrado no sistema (com email do sistema)</li>
                <li>Será criado um acesso admin separado com senha própria</li>
                <li>A senha temporária será enviada por email</li>
                <li>No primeiro login, será obrigatório trocar a senha</li>
              </ul>
            </div>
            <Button
              onClick={() => addAdminMutation.mutate()}
              disabled={!newAdminEmail || addAdminMutation.isPending}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {addAdminMutation.isPending ? "Adicionando..." : "Adicionar Administrador"}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administradores Ativos
            </CardTitle>
            <CardDescription>
              Lista de todos os administradores da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-4">
                {admins?.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {admin.profiles?.full_name || "Sem nome"}
                        </p>
                        <Badge variant={getRoleBadgeVariant(admin.role)}>
                          {getRoleLabel(admin.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {admin.profiles?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Concedido em:{" "}
                        {new Date(admin.granted_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteAdminId(admin.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este administrador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAdminId && deleteAdminMutation.mutate(deleteAdminId)}
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
