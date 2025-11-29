import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { TRIAL_DAYS } from "@/constants/plans";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
interface PlanCardPublicProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  planId: string;
  highlighted?: boolean;
  recommendation?: string;
  billingCycle?: "monthly" | "yearly";
}
export function PlanCardPublic({
  name,
  price,
  description,
  features,
  planId,
  highlighted = false,
  recommendation,
  billingCycle = "monthly"
}: PlanCardPublicProps) {
  const {
    user
  } = useAuth();
  const {
    hasWorkspaces
  } = useWorkspace();
  const navigate = useNavigate();
  const handleSelectPlan = () => {
    // Salvar plano e ciclo no localStorage
    localStorage.setItem("pending_plan_selection", planId);
    localStorage.setItem("pending_billing_cycle", billingCycle);

    // Se usuário já está autenticado e tem workspace, ir direto para pending-payment
    if (user && hasWorkspaces()) {
      navigate("/app/pending-payment");
    } else {
      // Se não está autenticado, ir para cadastro
      navigate(`/auth?tab=signup&plan=${planId}&cycle=${billingCycle}`);
    }
  };
  return <Card className={highlighted ? "border-primary/60 shadow-elegant relative scale-105" : "border-border/50"}>
      {highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-xs font-semibold shadow-md">
          Mais Popular
        </div>}
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-heading">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        {recommendation && <p className="text-sm font-medium mt-2 text-destructive">{recommendation}</p>}
        <div className="mt-6 pt-4 border-t border-border/30">
          <span className="text-5xl font-heading font-bold text-primary">R$ {price.toFixed(2)}</span>
          <span className="text-muted-foreground text-lg">/{billingCycle === "monthly" ? "mês" : "ano"}</span>
          {billingCycle === "yearly" && <div className="text-sm text-muted-foreground mt-1">
              Economize 10% no plano anual
            </div>}
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <ul className="space-y-4">
          {features.map((feature, index) => <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-card-foreground leading-relaxed">{feature}</span>
            </li>)}
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSelectPlan} className="w-full" variant={highlighted ? "default" : "outline"} size="lg">
          Testar {TRIAL_DAYS} Dias Grátis
        </Button>
      </CardFooter>
    </Card>;
}