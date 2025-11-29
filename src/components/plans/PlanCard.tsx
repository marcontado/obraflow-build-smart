import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, SubscriptionPlan } from "@/constants/plans";

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan?: SubscriptionPlan;
  onSelect?: () => void;
  billingCycle: "monthly" | "yearly";
}

export function PlanCard({ plan, currentPlan, onSelect, billingCycle }: PlanCardProps) {
  const limits = PLAN_LIMITS[plan];
  const isCurrentPlan = currentPlan === plan;
  const price = PLAN_PRICES[plan][billingCycle];

  const features = [
    `${limits.workspaces === Infinity ? "Ilimitados" : limits.workspaces} workspace${limits.workspaces > 1 ? "s" : ""}`,
    `${limits.membersPerWorkspace === Infinity ? "Ilimitados" : limits.membersPerWorkspace} membros por workspace`,
    `${limits.activeProjects === Infinity ? "Ilimitados" : limits.activeProjects} projetos ativos`,
    `${limits.maxClients === Infinity ? "Ilimitados" : limits.maxClients} clientes`,
  ];

  const extraFeatures = [];
  if (limits.features.gantt) extraFeatures.push("Gráfico Gantt");
  if (limits.features.reports) extraFeatures.push("Relatórios avançados");
  if (limits.features.invites) extraFeatures.push("Sistema de convites");
  if (limits.features.aiAssist) extraFeatures.push("Assistente IA");
  if (limits.features.clientPortal) extraFeatures.push("Portal do cliente");
  if (limits.features.customization) extraFeatures.push("Customização avançada");

  // Recomendações por plano
  const recommendations: Record<SubscriptionPlan, string> = {
    atelier: "Perfeito para testar a plataforma",
    studio: "Ideal para autônomos e profissionais independentes",
    domus: "Para escritórios ou equipes maiores",
  };

  return (
    <Card className={isCurrentPlan ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{PLAN_NAMES[plan]}</CardTitle>
          {isCurrentPlan && <Badge>Plano Atual</Badge>}
        </div>
        <p className="text-sm text-muted-foreground italic">{recommendations[plan]}</p>
        <CardDescription className="text-3xl font-bold">
          R$ {price}
          <span className="text-base font-normal text-muted-foreground">
            /{billingCycle === "monthly" ? "mês" : "ano"}
          </span>
        </CardDescription>
        {billingCycle === "yearly" && price > 0 && (
          <p className="text-sm text-muted-foreground">
            Economize {Math.round((1 - price / (PLAN_PRICES[plan].monthly * 12)) * 100)}%
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Recursos incluídos:</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {extraFeatures.map((feature, index) => (
              <li key={`extra-${index}`} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan}
          onClick={onSelect}
        >
          {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
        </Button>
      </CardFooter>
    </Card>
  );
}
