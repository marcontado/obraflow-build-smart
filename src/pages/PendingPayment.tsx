import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { subscriptionsService } from "@/services/subscriptions.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { STRIPE_PRICE_IDS } from "@/constants/plans";

export default function PendingPayment() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);

  const handleGoToCheckout = async () => {
    if (!currentWorkspace?.id) {
      toast.error("Workspace não encontrado");
      return;
    }

    const pendingPlan = localStorage.getItem("pending_plan_selection");
    const billingCycle = localStorage.getItem("pending_billing_cycle") || "monthly";

    if (!pendingPlan) {
      toast.error("Plano não selecionado. Redirecionando para seleção de planos...");
      setTimeout(() => navigate("/plans"), 1500);
      return;
    }

    setLoading(true);

    try {
      const priceId = STRIPE_PRICE_IDS[pendingPlan as keyof typeof STRIPE_PRICE_IDS][billingCycle as "monthly" | "yearly"];
      
      const { url } = await subscriptionsService.createCheckout(currentWorkspace.id, priceId, false);

      if (url) {
        window.location.href = url;
      } else {
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
              Ver Planos Disponíveis
            </Button>
          </div>

          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              ✓ Inclui 15 dias de teste grátis<br />
              ✓ Cancele a qualquer momento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
