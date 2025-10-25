import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCard } from "@/components/plans/PlanCard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SUBSCRIPTION_PLANS, STRIPE_PRICE_IDS } from "@/constants/plans";
import { useToast } from "@/hooks/use-toast";
import { subscriptionsService } from "@/services/subscriptions.service";
import type { SubscriptionPlan } from "@/constants/plans";

export default function PlanUpgrade() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("selected");

  // Auto-trigger checkout if selected plan is in URL
  useEffect(() => {
    if (selectedPlan && selectedPlan !== SUBSCRIPTION_PLANS.ATELIER && currentWorkspace) {
      handleSelectPlan(selectedPlan as SubscriptionPlan);
    }
  }, [selectedPlan, currentWorkspace]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === SUBSCRIPTION_PLANS.ATELIER) {
      toast({
        title: "Plano Gratuito",
        description: "Você já está no plano gratuito!",
      });
      return;
    }

    if (!currentWorkspace) {
      toast({
        title: "Erro",
        description: "Nenhum workspace selecionado",
        variant: "destructive",
      });
      return;
    }

    try {
      const priceId = STRIPE_PRICE_IDS[plan as Exclude<SubscriptionPlan, 'atelier'>][billingCycle];
      
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o checkout do Stripe",
      });

      const { url } = await subscriptionsService.createCheckout(currentWorkspace.id, priceId);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          Selecione o plano ideal para suas necessidades
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ciclo de cobrança</CardTitle>
          <CardDescription>Economize 10% com o plano anual</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Anual (economize 10%)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <PlanCard
          plan={SUBSCRIPTION_PLANS.ATELIER}
          currentPlan={currentWorkspace?.subscription_plan as SubscriptionPlan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.ATELIER)}
          billingCycle={billingCycle}
        />
        <PlanCard
          plan={SUBSCRIPTION_PLANS.STUDIO}
          currentPlan={currentWorkspace?.subscription_plan as SubscriptionPlan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.STUDIO)}
          billingCycle={billingCycle}
        />
        <PlanCard
          plan={SUBSCRIPTION_PLANS.DOMUS}
          currentPlan={currentWorkspace?.subscription_plan as SubscriptionPlan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.DOMUS)}
          billingCycle={billingCycle}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Precisa de ajuda para escolher?</CardTitle>
          <CardDescription>
            Entre em contato conosco para descobrir qual plano é o melhor para você
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.open("mailto:contato@workspace.com")}>
            Falar com vendas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
