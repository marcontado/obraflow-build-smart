import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminAdded: () => void;
}

type PlatformRole = "super_admin" | "support" | "analyst";

export function AddAdminDialog({
  open,
  onOpenChange,
  onAdminAdded,
}: AddAdminDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PlatformRole>("analyst");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; full_name: string | null } | null>(null);

  const handleSearchUser = async () => {
    if (!email) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("email", email)
        .single();

      if (error || !data) {
        toast.error("Usuário não encontrado no sistema");
        setFoundUser(null);
        return;
      }

      setFoundUser({ id: data.id, full_name: data.full_name });
      toast.success(`Usuário encontrado: ${data.full_name || data.email}`);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      toast.error("Erro ao buscar usuário");
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundUser) {
      toast.error("Busque um usuário primeiro");
      return;
    }

    setLoading(true);
    try {
      await adminService.addPlatformAdmin(foundUser.id, role);
      toast.success("Administrador adicionado com sucesso");
      onAdminAdded();
      onOpenChange(false);
      setEmail("");
      setRole("analyst");
      setFoundUser(null);
    } catch (error: any) {
      console.error("Erro ao adicionar admin:", error);
      toast.error(error.message || "Erro ao adicionar administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Administrador</DialogTitle>
            <DialogDescription>
              Busque um usuário existente no sistema e atribua uma role de administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Usuário</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSearchUser}
                  disabled={searching || !email}
                >
                  {searching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              {foundUser && (
                <p className="text-sm text-muted-foreground">
                  ✓ Usuário: {foundUser.full_name || email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role do Administrador</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as PlatformRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="support">Suporte</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === "super_admin" && "Acesso total ao sistema, pode gerenciar outros admins"}
                {role === "support" && "Pode alterar planos e cancelar assinaturas"}
                {role === "analyst" && "Apenas visualização e análise de dados"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !foundUser}>
              {loading ? "Adicionando..." : "Adicionar Administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
