import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { passwordSchema } from "@/schemas/password.schema";
import { ArrowLeft } from "lucide-react";

export default function AdminResetPasswordConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      toast.error("Token de reset inválido");
      navigate("/admin/login");
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token não encontrado");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Validar senha com schema
    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth/verify-reset', {
        body: { token, newPassword }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Senha atualizada com sucesso!");
      
      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast.error(error.message || "Erro ao atualizar senha. Verifique se o link não expirou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Definir Nova Senha
          </CardTitle>
          <CardDescription className="text-center">
            Crie uma senha forte para sua conta admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <PasswordInput
                id="newPassword"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </Button>

            <Link to="/admin/login">
              <Button variant="ghost" className="w-full" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
