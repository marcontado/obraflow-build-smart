import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('auth');
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

  useEffect(() => {
    // Verificar se veio de um link de reset de senha
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      setIsPasswordRecovery(true);
      toast.info(t('resetPassword.info'));
      return;
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
        setIsPasswordRecovery(true);
        toast.info(t('resetPassword.info'));
      } else if (session && event === 'SIGNED_IN' && !isPasswordRecovery) {
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isPasswordRecovery]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('resetPassword.passwordMismatch'));
      return;
    }

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error(error.message || t('resetPassword.updateError'));
        return;
      }

      toast.success(t('resetPassword.success'));
      
      setIsPasswordRecovery(false);
      setNewPassword("");
      setConfirmPassword("");
      
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar senha:', error);
      toast.error(t('resetPassword.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    if (selectedPlan) {
      localStorage.setItem("pending_plan_selection", selectedPlan);
    }

    const { error } = await authService.signUp(email, password);

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('register.success'));
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
      toast.success(t('login.success'));
      navigate("/app");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Link to="/" className="absolute top-4 left-4 z-10 text-sm text-black hover:text-primary flex items-center gap-1">
        {t('welcome.backToHome')}
      </Link>
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={heroImage}
          alt="Interior Design Workspace"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center justify-center p-12">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">{t('hero.title')}</h1>
            <p className="text-xl mb-6">{t('hero.subtitle')}</p>
            <ul className="space-y-3 text-lg">
              <li>{t('hero.feature1')}</li>
              <li>{t('hero.feature2')}</li>
              <li>{t('hero.feature3')}</li>
              <li>{t('hero.feature4')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        {isPasswordRecovery ? (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">{t('resetPassword.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('resetPassword.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('resetPassword.newPassword')}</Label>
                  <PasswordInput
                    id="new-password"
                    placeholder={t('resetPassword.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <PasswordStrength password={newPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('resetPassword.confirmPassword')}</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('resetPassword.updatingButton') : t('resetPassword.updateButton')}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">{t('welcome.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('welcome.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
            {selectedPlan && (
              <div className="mb-4 p-3 bg-accent/10 rounded-md text-sm text-center" dangerouslySetInnerHTML={{ __html: t('welcome.selectedPlan', { plan: selectedPlan }) }} />
            )}
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">{t('login.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('register.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">{t('login.email')}</Label>
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
                    <Label htmlFor="password-signin">{t('login.password')}</Label>
                    <PasswordInput
                      id="password-signin"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('login.signInLoading') : t('login.signIn')}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/reset-password")}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('login.forgotPassword')}
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('register.fullName')}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('register.fullName')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">{t('register.email')}</Label>
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
                    <Label htmlFor="password-signup">{t('register.password')}</Label>
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
                    {loading ? t('register.signUpLoading') : t('register.signUp')}
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
