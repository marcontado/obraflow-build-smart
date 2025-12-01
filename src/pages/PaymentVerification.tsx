import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { PaymentProgress } from "@/components/subscription/PaymentProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const VERIFICATION_STEPS = [
  { label: "Plano Selecionado", description: "Escolha feita" },
  { label: "Cadastro", description: "Conta criada" },
  { label: "Checkout", description: "Pagamento processado" },
  { label: "Verificação", description: "Confirmando pagamento" },
  { label: "Acesso Liberado", description: "Entrando no sistema" },
];

export default function PaymentVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(3); // Começa na verificação
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId || !currentWorkspace?.id) {
      console.error("Session ID ou workspace não encontrado");
      setVerificationStatus("error");
      setErrorMessage("Sessão de pagamento inválida");
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 30 segundos (30 tentativas x 1 segundo)
    
    const checkSubscription = async () => {
      try {
        console.log(`Verificação ${attempts + 1}/${maxAttempts} - Workspace:`, currentWorkspace.id);
        
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("workspace_id", currentWorkspace.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar subscription:", error);
          return false;
        }

        console.log("Subscription encontrada:", subscription);

        if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
          console.log("✓ Pagamento confirmado! Status:", subscription.status);
          setCurrentStep(4); // Acesso liberado
          setVerificationStatus("success");
          
          // Aguarda 2 segundos antes de redirecionar
          setTimeout(async () => {
            await refreshWorkspaces();
            toast.success("Pagamento confirmado! Bem-vindo ao Archestra!");
            navigate("/app", { replace: true });
          }, 2000);
          
          return true;
        }

        return false;
      } catch (error) {
        console.error("Erro inesperado:", error);
        return false;
      }
    };

    const interval = setInterval(async () => {
      attempts++;
      
      const confirmed = await checkSubscription();
      
      if (confirmed) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error("Timeout na verificação do pagamento");
        setVerificationStatus("error");
        setErrorMessage("Não conseguimos confirmar seu pagamento. Por favor, aguarde alguns minutos e recarregue a página.");
      }
    }, 1000); // Verifica a cada 1 segundo

    // Primeira verificação imediata
    checkSubscription().then(confirmed => {
      if (confirmed) {
        clearInterval(interval);
      }
    });

    return () => clearInterval(interval);
  }, [sessionId, currentWorkspace?.id, navigate, refreshWorkspaces]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleContactSupport = () => {
    navigate("/app/suporte");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center space-y-4">
          {verificationStatus === "verifying" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl">Verificando Pagamento</CardTitle>
                <CardDescription className="text-base mt-2">
                  Aguarde enquanto confirmamos seu pagamento no Stripe...
                </CardDescription>
              </div>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl text-green-600">Pagamento Confirmado!</CardTitle>
                <CardDescription className="text-base mt-2">
                  Redirecionando para o sistema...
                </CardDescription>
              </div>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl">Erro na Verificação</CardTitle>
                <CardDescription className="text-base mt-2 text-destructive">
                  {errorMessage}
                </CardDescription>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>
          <PaymentProgress currentStep={currentStep} steps={VERIFICATION_STEPS} />

          {verificationStatus === "verifying" && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Este processo pode levar alguns segundos...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Session ID: {sessionId?.substring(0, 20)}...
              </p>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="mt-8 space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Se você completou o pagamento no Stripe, ele será confirmado em breve.
                  Você pode tentar recarregar a página ou entrar em contato com o suporte.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetry} variant="outline">
                  Tentar Novamente
                </Button>
                <Button onClick={handleContactSupport}>
                  Contatar Suporte
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
