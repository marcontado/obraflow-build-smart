import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-16 px-4 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl">Checkout Cancelado</CardTitle>
          <CardDescription>
            Você cancelou o processo de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não se preocupe! Você pode tentar novamente quando estiver pronto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/plans")}>
              Ver Planos Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
