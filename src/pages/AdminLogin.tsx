import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminAuthService } from "@/services/admin-auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { passwordSchema } from "@/schemas/password.schema";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forçar tema claro na página de Admin Login
  useEffect(() => {
    const htmlElement = document.documentElement;
    const hadDarkClass = htmlElement.classList.contains('dark');
    htmlElement.classList.remove('dark');
    
    return () => {
      if (hadDarkClass) {
        htmlElement.classList.add('dark');
      }
    };
  }, []);

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

    // Validar senha com schema
    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
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
                <PasswordInput
                  id="password"
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
              <PasswordInput
                id="newPassword"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrength password={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <PasswordInput
                id="confirmPassword"
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
