import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanComparisonProps {
  selectedPlan?: string;
}

export function PlanComparison({ selectedPlan }: PlanComparisonProps) {
  const plans = [
    {
      id: "atelier",
      name: "Atelier",
      price: "R$ 0",
      description: "Perfeito para testar a plataforma",
      recommendation: "Ideal para começar",
      features: ["1 workspace", "3 membros", "2 projetos", "Dashboard básico"],
    },
    {
      id: "studio",
      name: "Studio",
      price: "R$ 149",
      description: "Ideal para autônomos e profissionais independentes",
      recommendation: "Mais popular",
      features: ["2 workspaces", "10 membros", "Projetos ilimitados", "Gantt completo", "Relatórios"],
      highlighted: true,
    },
    {
      id: "domus",
      name: "Domus",
      price: "R$ 399",
      description: "Para escritórios ou equipes maiores",
      recommendation: "Solução completa",
      features: ["Workspaces ilimitados", "Membros ilimitados", "IA Assist", "Portal do cliente", "Customização"],
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center">Compare os Planos</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`${selectedPlan === plan.id ? "border-primary shadow-lg" : "border-border/50"} ${
              plan.highlighted ? "border-primary/60" : ""
            } relative`}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                {plan.recommendation}
              </Badge>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <p className="text-2xl font-bold text-primary">{plan.price}</p>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
              <p className="text-xs font-medium text-accent-foreground">{plan.recommendation}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Você poderá mudar de plano a qualquer momento após criar sua conta
      </p>
    </div>
  );
}
