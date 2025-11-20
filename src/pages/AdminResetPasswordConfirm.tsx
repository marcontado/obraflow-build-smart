import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

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

    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Requisitos da senha:</strong>
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Mínimo de 8 caracteres</li>
                <li>• Use uma combinação forte de letras e números</li>
              </ul>
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
