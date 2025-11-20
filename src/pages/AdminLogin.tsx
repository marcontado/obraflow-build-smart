import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminAuthService } from "@/services/admin-auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Verificar se já tem token válido
    if (adminAuthService.isTokenValid()) {
      const hasSession = sessionStorage.getItem('admin_session') === 'true';
      const timestamp = sessionStorage.getItem('admin_session_timestamp');
      const isSessionValid = timestamp && (Date.now() - parseInt(timestamp)) < 30 * 60 * 1000;
      
      if (hasSession && isSessionValid) {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAuthService.adminLogin(email, password);
      
      setLoading(false);

      // Se é primeiro login, forçar troca de senha
      if (response.firstLogin) {
        setShowChangePassword(true);
        toast.info("Por favor, altere sua senha antes de continuar");
        return;
      }

      // Marcar sessão admin
      sessionStorage.setItem('admin_session', 'true');
      sessionStorage.setItem('admin_session_timestamp', Date.now().toString());
      toast.success("Login admin realizado com sucesso!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Credenciais inválidas");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      await adminAuthService.adminChangePassword(password, newPassword);
      
      setLoading(false);
      setShowChangePassword(false);
      
      // Marcar sessão admin
      sessionStorage.setItem('admin_session', 'true');
      sessionStorage.setItem('admin_session_timestamp', Date.now().toString());
      toast.success("Senha alterada com sucesso!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Erro ao alterar senha");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4 flex gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ← Voltar para home
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Login Sistema
            </Button>
          </Link>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center">Painel Administrativo</CardTitle>
            <CardDescription className="text-center">
              Acesso restrito para administradores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@archestra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha Admin</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Autenticando..." : "Acessar Painel Admin"}
              </Button>

              <div className="text-center">
                <Link to="/admin/reset-password" className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para troca de senha no primeiro acesso */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Este é seu primeiro acesso. Por favor, altere sua senha antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
