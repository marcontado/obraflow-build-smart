import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSetup() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkIfNeedsSetup();
  }, []);

  const checkIfNeedsSetup = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: needsSetup, error } = await supabase.rpc('admin_needs_password_setup', {
        _user_id: session.user.id
      });

      if (error) {
        console.error('Error checking setup status:', error);
        toast.error("Erro ao verificar status");
        navigate("/admin/login");
        return;
      }

      if (!needsSetup) {
        // Já configurou senha, redirecionar para login
        toast.info("Senha já configurada. Faça login normalmente.");
        navigate("/admin/login");
      }
    } catch (error) {
      console.error('Error in checkIfNeedsSetup:', error);
      navigate("/admin/login");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessão expirada");
        navigate("/admin/login");
        return;
      }

      // Atualizar senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        toast.error("Erro ao definir senha: " + updateError.message);
        return;
      }

      // Marcar como senha configurada
      const { error: markError } = await supabase.rpc('mark_admin_password_configured', {
        _user_id: session.user.id
      });

      if (markError) {
        console.error('Error marking password configured:', markError);
        toast.error("Erro ao finalizar configuração");
        return;
      }

      toast.success("Senha definida com sucesso!");
      
      // Fazer logout para que o admin faça login com a nova senha
      await supabase.auth.signOut();
      navigate("/admin/login");

    } catch (error) {
      console.error('Error in handleSetPassword:', error);
      toast.error("Erro ao configurar senha");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-pulse">Verificando status...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Configuração Inicial</CardTitle>
          <CardDescription>
            Defina sua senha de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Configurando..." : "Definir Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
