import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { subscriptionsService } from "@/services/subscriptions.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CreditCard, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { STRIPE_PRICE_IDS } from "@/constants/plans";

export default function PendingPayment() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [hasPlansInStorage, setHasPlansInStorage] = useState(false);

  useEffect(() => {
    // Verificar se tem plano no localStorage
    const pendingPlan = localStorage.getItem("pending_plan_selection");
    setHasPlansInStorage(!!pendingPlan);
    console.log("PendingPayment - Plano no localStorage:", pendingPlan);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
      setLoading(false);
    }
  };

  const handleGoToCheckout = async () => {
    if (!currentWorkspace?.id) {
      toast.error("Workspace não encontrado");
      return;
    }

    const pendingPlan = localStorage.getItem("pending_plan_selection");
    const billingCycle = localStorage.getItem("pending_billing_cycle") || "monthly";

    console.log("handleGoToCheckout - Plano:", pendingPlan, "Ciclo:", billingCycle);

    if (!pendingPlan) {
      console.error("Nenhum plano encontrado no localStorage");
      toast.error("Plano não selecionado. Redirecionando para seleção de planos...");
      setTimeout(() => navigate("/plans"), 1500);
      return;
    }

    setLoading(true);

    try {
      const priceId = STRIPE_PRICE_IDS[pendingPlan as keyof typeof STRIPE_PRICE_IDS][billingCycle as "monthly" | "yearly"];
      
      console.log("Criando checkout para workspace:", currentWorkspace.id, "com priceId:", priceId);
      
      const { url } = await subscriptionsService.createCheckout(currentWorkspace.id, priceId, false);

      console.log("Checkout URL recebida:", url);

      if (url) {
        console.log("Redirecionando para Stripe...");
        window.location.href = url;
      } else {
        console.error("URL de checkout não retornada");
        toast.error("Erro ao criar sessão de checkout");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.message || "Erro ao processar pagamento");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Card className="w-full max-w-lg shadow-lg border-destructive/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl">Pagamento Pendente</CardTitle>
            <CardDescription className="text-base mt-2">
              Finalize seu pagamento para acessar o Archestra
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-accent/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Seu workspace foi criado, mas ainda precisamos confirmar seu pagamento para liberar o acesso completo ao sistema.
            </p>
          </div>

          {hasPlansInStorage ? (
            <div className="space-y-3">
              <Button 
                onClick={handleGoToCheckout} 
                disabled={loading} 
                className="w-full h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ir para Checkout
                  </>
                )}
              </Button>

              <Button 
                onClick={() => navigate("/plans")} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                Escolher Outro Plano
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">
                  Nenhum plano foi selecionado. Por favor, escolha um plano para continuar.
                </p>
              </div>
              
              <Button 
                onClick={() => navigate("/plans")} 
                className="w-full h-12 text-base"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Escolher um Plano
              </Button>
            </div>
          )}

          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              ✓ Inclui 15 dias de teste grátis<br />
              ✓ Cancele a qualquer momento
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-destructive"
              disabled={loading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
