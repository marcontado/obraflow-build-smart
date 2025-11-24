import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  totalQuoted: number;
}

export function BudgetSummaryCards({ totalBudget, totalSpent, totalQuoted }: BudgetSummaryCardsProps) {
  const available = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalBudget.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-xs text-muted-foreground">Definido pelo cliente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gasto Atual</CardTitle>
          <TrendingUp className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-xs text-muted-foreground">Comprado + Aplicado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${available >= 0 ? "text-green-600" : "text-destructive"}`}>
            {available.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-xs text-muted-foreground">
            {available >= 0 ? "Dentro do orçamento" : "Acima do orçamento"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% Utilizado</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${percentUsed > 100 ? "text-destructive" : ""}`}>
            {percentUsed.toFixed(1)}%
          </div>
          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${percentUsed > 100 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
