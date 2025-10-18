import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCard } from "@/components/plans/PlanCard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SUBSCRIPTION_PLANS } from "@/constants/plans";
import { useToast } from "@/hooks/use-toast";

export default function PlanUpgrade() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (plan: string) => {
    toast({
      title: "Em desenvolvimento",
      description: "A integração com pagamentos será implementada em breve.",
    });
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
          <CardDescription>Economize até 17% com o plano anual</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Anual (economize 17%)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <PlanCard
          plan={SUBSCRIPTION_PLANS.ATELIER}
          currentPlan={currentWorkspace?.subscription_plan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.ATELIER)}
          billingCycle={billingCycle}
        />
        <PlanCard
          plan={SUBSCRIPTION_PLANS.STUDIO}
          currentPlan={currentWorkspace?.subscription_plan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.STUDIO)}
          billingCycle={billingCycle}
        />
        <PlanCard
          plan={SUBSCRIPTION_PLANS.DOMMUS}
          currentPlan={currentWorkspace?.subscription_plan}
          onSelect={() => handleSelectPlan(SUBSCRIPTION_PLANS.DOMMUS)}
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
