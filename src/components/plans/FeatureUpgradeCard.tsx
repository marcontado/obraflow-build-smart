import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Lock } from "lucide-react";

interface FeatureUpgradeCardProps {
  title: string;
  description: string;
  requiredPlan: 'studio' | 'domus';
  icon?: React.ReactNode;
}

export function FeatureUpgradeCard({ 
  title, 
  description, 
  requiredPlan,
  icon 
}: FeatureUpgradeCardProps) {
  const navigate = useNavigate();

  const planConfig = {
    studio: {
      name: "Studio",
      badge: "PRO",
      badgeColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: <Crown className="h-5 w-5" />,
    },
    domus: {
      name: "Domus",
      badge: "BUSINESS",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: <Sparkles className="h-5 w-5" />,
    }
  };

  const config = planConfig[requiredPlan];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              {icon || <Lock className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                <Badge className={`${config.badgeColor} text-white border-0`}>
                  {config.icon}
                  <span className="ml-1">{config.badge}</span>
                </Badge>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Este recurso está disponível no plano <strong>{config.name}</strong>.
          Faça upgrade para desbloquear esta funcionalidade e muito mais.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/plans")} className="w-full">
            Ver Planos
          </Button>
          <Button onClick={() => navigate("/plans")} variant="outline">
            Comparar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
