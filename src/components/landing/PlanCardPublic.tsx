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
    <Card className={highlighted ? "border-primary shadow-lg relative" : ""}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-semibold">
          Mais Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">R$ {price}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-card-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={highlighted ? "default" : "outline"}>
          <Link to={`/auth?tab=signup&plan=${planId}`}>Começar Agora</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
