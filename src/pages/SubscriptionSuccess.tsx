import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PaymentProgress } from "@/components/subscription/PaymentProgress";

const PAYMENT_STEPS = [
  { label: "Plano Selecionado", description: "Escolha feita" },
  { label: "Cadastro", description: "Conta criada" },
  { label: "Checkout", description: "Pagamento processado" },
  { label: "Verificação", description: "Confirmando pagamento" },
  { label: "Acesso Liberado", description: "Entrando no sistema" },
];

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      toast({
        title: "Pagamento confirmado!",
        description: "Seu plano foi ativado com sucesso.",
      });
    }
  }, [sessionId, toast]);

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentProgress currentStep={4} steps={PAYMENT_STEPS} />
          
          <p className="text-muted-foreground">
            Obrigado por escolher nossos serviços! Agora você tem acesso a todos os recursos do seu plano.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/")}>
              Ir para Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/workspace/settings")}>
              Ver Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
