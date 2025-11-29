import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { passwordSchema } from "@/schemas/password.schema";
import heroImage from "@/assets/hero-workspace.jpg";


export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const defaultTab = searchParams.get("tab") || "signin";
  const selectedPlan = searchParams.get("plan");
  const skipTrial = searchParams.get("trial") === "false";

  // Forçar tema claro na página de Auth
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
    // Verificar se veio de um link de reset de senha
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      // É um link de reset de senha - mostrar formulário
      setIsPasswordRecovery(true);
      toast.info("Digite sua nova senha abaixo");
      return; // Não fazer mais nada
    }

    const checkSession = async () => {
      const { session } = await authService.getCurrentSession();
      if (session && !isPasswordRecovery) {
        navigate("/app");
      }
    };
    checkSession();

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuário clicou no link de reset de senha
        setIsPasswordRecovery(true);
        toast.info("Digite sua nova senha abaixo");
      } else if (session && event === 'SIGNED_IN' && !isPasswordRecovery) {
        // For sign in normal, go to /app
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isPasswordRecovery]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Atualizar senha durante o fluxo de recovery
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error(error.message || "Erro ao atualizar senha");
        return;
      }

      toast.success("Senha atualizada com sucesso! Faça login com a nova senha.");
      
      // Limpar estados
      setIsPasswordRecovery(false);
      setNewPassword("");
      setConfirmPassword("");
      
      // IMPORTANTE: Fazer logout para forçar novo login
      await supabase.auth.signOut();
      
      // Redirecionar para login após breve delay
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar senha:', error);
      toast.error("Erro inesperado ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senha com schema
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    // Save selected plan and trial preference if present in URL
    if (selectedPlan) {
      localStorage.setItem("pending_plan_selection", selectedPlan);
      localStorage.setItem("pending_skip_trial", skipTrial ? "true" : "false");
    }

    // 1. Cadastro no Supabase
    const { data, error } = await authService.signUp(email, password);

    // 2. Se não houver erro, pega o id do usuário criado
    let supabaseId;
    if (!error && data?.user?.id) {
      supabaseId = data.user.id;
    }

    // 3. Cadastro no backend DynamoDB usando o mesmo id
    try {
      const response = await fetch("https://archestra-backend.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: supabaseId, 
          name: fullName,
          email,
          password,
          plan: selectedPlan,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Erro ao cadastrar no backend.");
      }
    } catch (err: any) {
      toast.error("Erro ao cadastrar no backend.");
    }

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/onboarding"), 1000);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authService.signIn(email, password);

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/app");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Link to="/" className="absolute top-4 left-4 z-10 text-sm text-black hover:text-primary flex items-center gap-1">
        ← Voltar para home
      </Link>
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={heroImage}
          alt="Interior Design Workspace"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center justify-center p-12">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Archestra</h1>
            <p className="text-xl mb-6">Gestão profissional de obras para designers de interiores</p>
            <ul className="space-y-3 text-lg">
              <li>✓ Organize todos os seus projetos em um só lugar</li>
              <li>✓ Acompanhe orçamentos e prazos em tempo real</li>
              <li>✓ Colabore com clientes e fornecedores</li>
              <li>✓ Relatórios e análises completas</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        {isPasswordRecovery ? (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">Redefinir Senha</CardTitle>
              <CardDescription className="text-center">
                Digite sua nova senha abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <PasswordInput
                    id="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <PasswordStrength password={newPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">Bem-vindo</CardTitle>
              <CardDescription className="text-center">
                Entre ou crie uma conta para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
          {selectedPlan && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Você selecionou o plano: <span className="font-semibold text-primary">{selectedPlan.toUpperCase()}</span>
                {skipTrial && (
                  <span className="block text-xs mt-1">Assinatura sem período de teste</span>
                )}
              </p>
            </div>
          )}
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input
                      id="email-signin"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">Senha</Label>
                    <PasswordInput
                      id="password-signin"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/reset-password")}
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Senha</Label>
                    <PasswordInput
                      id="password-signup"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <PasswordStrength password={password} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
