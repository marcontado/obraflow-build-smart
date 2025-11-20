import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PlanCardPublicProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  planId: string;
  highlighted?: boolean;
}

export function PlanCardPublic({ name, price, description, features, planId, highlighted }: PlanCardPublicProps) {
  return (
    <Card className={highlighted ? "border-primary/60 shadow-elegant relative scale-105" : "border-border/50"}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-xs font-semibold shadow-md">
          Mais Popular
        </div>
      )}
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-heading">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        <div className="mt-6 pt-4 border-t border-border/30">
          <span className="text-5xl font-heading font-bold text-primary">R$ {price}</span>
          <span className="text-muted-foreground text-lg">/mês</span>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-card-foreground leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={highlighted ? "default" : "outline"} size="lg">
          <Link to={`/auth?tab=signup&plan=${planId}`}>Começar Agora</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
