import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkAdminSession = async () => {
      const { session } = await authService.getCurrentSession();
      if (session) {
        // Verificar se é admin
        const { data: isAdminData } = await supabase.rpc('is_platform_admin', { 
          _user_id: session.user.id 
        });
        
        if (isAdminData) {
          // Marcar sessão admin e ir para dashboard
          sessionStorage.setItem('admin_session', 'true');
          sessionStorage.setItem('admin_session_timestamp', Date.now().toString());
          navigate('/admin/dashboard');
        } else {
          // Se está logado mas não é admin, fazer logout e mostrar mensagem
          await authService.signOut();
          toast.error("Acesso não autorizado");
        }
      }
    };
    checkAdminSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authService.signIn(email, password);

    if (error) {
      setLoading(false);
      toast.error("Credenciais inválidas");
      return;
    }

    if (data?.user) {
      // Verificar se o usuário é admin
      const { data: isAdminData, error: adminError } = await supabase.rpc('is_platform_admin', { 
        _user_id: data.user.id 
      });

      setLoading(false);

      if (adminError || !isAdminData) {
        await authService.signOut();
        toast.error("Acesso negado. Apenas administradores podem acessar este painel.");
        return;
      }

      // Marcar sessão admin
      sessionStorage.setItem('admin_session', 'true');
      sessionStorage.setItem('admin_session_timestamp', Date.now().toString());
      toast.success("Login admin realizado com sucesso!");
      navigate("/admin/dashboard");
    }
  };

  return (
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Senha</Label>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
