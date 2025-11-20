import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";

interface SubscriptionMetricsProps {
  totalMRR: number;
  atelierCount: number;
  studioCount: number;
  domusCount: number;
  activeSubscriptions: number;
}

export function SubscriptionMetrics({
  totalMRR,
  atelierCount,
  studioCount,
  domusCount,
  activeSubscriptions,
}: SubscriptionMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalMRR)}</div>
          <p className="text-xs text-muted-foreground">
            Receita mensal recorrente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {studioCount} Studio + {domusCount} Domus
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plano Studio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studioCount}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(studioCount * 149)}/mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plano Domus</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{domusCount}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(domusCount * 399)}/mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
