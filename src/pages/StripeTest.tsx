import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, RefreshCw, XCircle, CheckCircle, Zap, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { subscriptionsService } from "@/services/subscriptions.service";
import { STRIPE_PRICE_IDS, PLAN_NAMES, SUBSCRIPTION_PLANS } from "@/constants/plans";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StripeTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkSubscriptionStatus = async () => {
    if (!currentWorkspace) return;
    
    try {
      const data = await subscriptionsService.getSubscription(currentWorkspace.id);
      const hasSubscription = !!data.subscription?.stripe_subscription_id;
      setHasActiveSubscription(hasSubscription);
      setSubscriptionStatus(data.subscription?.status || 'Nenhuma');
      
      if (hasSubscription) {
        addResult(`✅ Assinatura ativa detectada: ${data.subscription?.status}`);
      } else {
        addResult(`⚠️ Nenhuma assinatura ativa. Use "Criar Checkout" primeiro.`);
      }
    } catch (error) {
      setHasActiveSubscription(false);
      setSubscriptionStatus('Nenhuma');
    }
  };

  const testCheckout = async (plan: 'studio' | 'domus', billing: 'monthly' | 'yearly') => {
    if (!currentWorkspace) {
      toast({
        title: "Erro",
        description: "Nenhum workspace selecionado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      addResult(`Iniciando checkout para plano ${plan} (${billing})...`);
      
      const priceId = STRIPE_PRICE_IDS[plan][billing];
      const { url } = await subscriptionsService.createCheckout(currentWorkspace.id, priceId);
      
      if (url) {
        addResult("✅ Checkout criado com sucesso!");
        addResult(`URL: ${url}`);
        toast({
          title: "Checkout criado",
          description: "URL gerada com sucesso. Abrindo em nova aba...",
        });
        window.open(url, '_blank');
      }
    } catch (error: any) {
      addResult(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetSubscription = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      addResult("Buscando detalhes da assinatura...");
      
      const data = await subscriptionsService.getSubscription(currentWorkspace.id);
      
      const hasSubscription = !!data.subscription?.stripe_subscription_id;
      setHasActiveSubscription(hasSubscription);
      setSubscriptionStatus(data.subscription?.status || 'Nenhuma');
      
      addResult("✅ Assinatura encontrada!");
      addResult(`Status: ${data.subscription?.status || 'N/A'}`);
      addResult(`Plano: ${currentWorkspace.subscription_plan}`);
      addResult(`Stripe ID: ${data.subscription?.stripe_subscription_id || 'N/A'}`);
      
      toast({
        title: "Sucesso",
        description: "Dados da assinatura carregados",
      });
    } catch (error: any) {
      addResult(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar status da assinatura ao carregar
  useEffect(() => {
    checkSubscriptionStatus();
  }, [currentWorkspace]);

  const testUpdateSubscription = async (newPlan: 'studio' | 'domus', billing: 'monthly' | 'yearly') => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      addResult(`Atualizando para plano ${newPlan} (${billing})...`);
      
      const priceId = STRIPE_PRICE_IDS[newPlan][billing];
      const data = await subscriptionsService.updateSubscription(currentWorkspace.id, priceId);
      
      addResult("✅ Plano atualizado com sucesso!");
      addResult(`Novo plano: ${data.plan}`);
      
      toast({
        title: "Plano atualizado",
        description: "A página será recarregada em 2 segundos...",
      });
      
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      const isNoSubscription = errorMessage.includes('No active subscription');
      
      if (isNoSubscription) {
        addResult(`⚠️ Nenhuma assinatura ativa encontrada`);
        addResult(`💡 Dica: Primeiro crie uma assinatura usando os botões de "Criar Checkout"`);
        toast({
          title: "Assinatura necessária",
          description: "Você precisa criar uma assinatura primeiro. Use os botões 'Criar Checkout' acima.",
          variant: "destructive",
        });
      } else {
        addResult(`❌ Erro: ${errorMessage}`);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testCancelSubscription = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      addResult("Cancelando assinatura...");
      
      const data = await subscriptionsService.cancelSubscription(currentWorkspace.id);
      
      addResult("✅ Assinatura cancelada!");
      addResult(`Será cancelada em: ${new Date(data.cancel_at).toLocaleDateString()}`);
      
      toast({
        title: "Cancelamento agendado",
        description: "A assinatura será cancelada no fim do período",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      const isNoSubscription = errorMessage.includes('No active subscription') || errorMessage.includes('not found');
      
      if (isNoSubscription) {
        addResult(`⚠️ Nenhuma assinatura ativa encontrada`);
        addResult(`💡 Dica: Primeiro crie uma assinatura usando os botões de "Criar Checkout"`);
        toast({
          title: "Assinatura necessária",
          description: "Você precisa criar uma assinatura primeiro. Use os botões 'Criar Checkout' acima.",
          variant: "destructive",
        });
      } else {
        addResult(`❌ Erro: ${errorMessage}`);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testReactivateSubscription = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      addResult("Reativando assinatura...");
      
      await subscriptionsService.reactivateSubscription(currentWorkspace.id);
      
      addResult("✅ Assinatura reativada!");
      
      toast({
        title: "Assinatura reativada",
        description: "A assinatura continuará ativa",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      const isNoSubscription = errorMessage.includes('No active subscription') || errorMessage.includes('not found');
      
      if (isNoSubscription) {
        addResult(`⚠️ Nenhuma assinatura ativa encontrada`);
        addResult(`💡 Dica: Primeiro crie uma assinatura usando os botões de "Criar Checkout"`);
        toast({
          title: "Assinatura necessária",
          description: "Você precisa criar uma assinatura primeiro. Use os botões 'Criar Checkout' acima.",
          variant: "destructive",
        });
      } else {
        addResult(`❌ Erro: ${errorMessage}`);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testPortalSession = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      addResult("Criando sessão do portal...");
      
      const { url } = await subscriptionsService.createPortalSession(currentWorkspace.id);
      
      if (url) {
        addResult("✅ Portal criado com sucesso!");
        addResult(`URL: ${url}`);
        toast({
          title: "Portal criado",
          description: "Abrindo portal do Stripe...",
        });
        window.open(url, '_blank');
      }
    } catch (error: any) {
      addResult(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold mb-2">Teste de Integração Stripe</h1>
        <p className="text-muted-foreground">
          Teste todos os fluxos de pagamento e assinatura
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Alert>
          <AlertDescription>
            <div className="space-y-1">
              <p><strong>Workspace:</strong> {currentWorkspace?.name || 'Nenhum'}</p>
              <p><strong>Plano:</strong> <Badge className="ml-2">{PLAN_NAMES[currentWorkspace?.subscription_plan as keyof typeof PLAN_NAMES]}</Badge></p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className={hasActiveSubscription ? "border-green-500/50 bg-green-500/5" : "border-orange-500/50 bg-orange-500/5"}>
          <AlertDescription>
            <div className="flex items-center gap-2">
              {hasActiveSubscription ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600">Assinatura Ativa</p>
                    <p className="text-sm">Status: {subscriptionStatus}</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-600">Sem Assinatura</p>
                    <p className="text-sm">Crie um checkout primeiro</p>
                  </div>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">📋 Fluxo de Teste:</p>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>Clique em um dos botões de <strong>Criar Checkout</strong> (Studio ou Domus)</li>
              <li>Complete o pagamento no Stripe usando cartão de teste: <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code></li>
              <li>Após o pagamento, o webhook criará a assinatura automaticamente</li>
              <li>Então você poderá testar Update, Cancel e Reactivate</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Os botões Update/Cancel/Reactivate só funcionam após criar uma assinatura válida
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Alert className="mb-6 border-accent/50 bg-accent/5">
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">📍 Informações Importantes:</p>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li><strong>Portal do Cliente:</strong> Após criar assinatura, abre o Stripe Customer Portal para gerenciar pagamento, ver faturas e cancelar.</li>
              <li><strong>Visualizar Invoices no App:</strong> Acesse <strong>Menu Lateral → Configurações → Aba "Assinatura"</strong> para ver histórico de faturas.</li>
              <li><strong>Página Pública de Planos (<code>/plans</code>):</strong> Página de marketing para novos usuários. Links levam para signup com plano pré-selecionado.</li>
              <li><strong>Upgrade/Downgrade:</strong> Use os botões "Atualizar Plano" nesta página para testar mudanças após criar assinatura.</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                1. Criar Checkout
              </CardTitle>
              <CardDescription>
                Cria uma sessão de checkout do Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => testCheckout('studio', 'monthly')}
                  disabled={loading}
                  variant="outline"
                >
                  Studio Mensal
                </Button>
                <Button 
                  onClick={() => testCheckout('studio', 'yearly')}
                  disabled={loading}
                  variant="outline"
                >
                  Studio Anual
                </Button>
                <Button 
                  onClick={() => testCheckout('domus', 'monthly')}
                  disabled={loading}
                  variant="outline"
                >
                  Domus Mensal
                </Button>
                <Button 
                  onClick={() => testCheckout('domus', 'yearly')}
                  disabled={loading}
                  variant="outline"
                >
                  Domus Anual
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                2. Buscar Assinatura
              </CardTitle>
              <CardDescription>
                Obtém detalhes da assinatura atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testGetSubscription}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Buscar Detalhes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                3. Atualizar Plano
              </CardTitle>
              <CardDescription>
                Faz upgrade/downgrade do plano atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hasActiveSubscription && (
                <p className="text-sm text-orange-600 mb-2">⚠️ Requer assinatura ativa</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => testUpdateSubscription('studio', 'monthly')}
                  disabled={loading || !hasActiveSubscription}
                  variant="outline"
                >
                  → Studio Mensal
                </Button>
                <Button 
                  onClick={() => testUpdateSubscription('studio', 'yearly')}
                  disabled={loading || !hasActiveSubscription}
                  variant="outline"
                >
                  → Studio Anual
                </Button>
                <Button 
                  onClick={() => testUpdateSubscription('domus', 'monthly')}
                  disabled={loading || !hasActiveSubscription}
                  variant="outline"
                >
                  → Domus Mensal
                </Button>
                <Button 
                  onClick={() => testUpdateSubscription('domus', 'yearly')}
                  disabled={loading || !hasActiveSubscription}
                  variant="outline"
                >
                  → Domus Anual
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                4. Cancelar / Reativar
              </CardTitle>
              <CardDescription>
                Cancela ou reativa a assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!hasActiveSubscription && (
                <p className="text-sm text-orange-600 mb-2">⚠️ Requer assinatura ativa</p>
              )}
              <Button 
                onClick={testCancelSubscription}
                disabled={loading || !hasActiveSubscription}
                variant="destructive"
                className="w-full"
              >
                Cancelar Assinatura
              </Button>
              <Button 
                onClick={testReactivateSubscription}
                disabled={loading || !hasActiveSubscription}
                variant="default"
                className="w-full"
              >
                Reativar Assinatura
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                5. Portal do Cliente
              </CardTitle>
              <CardDescription>
                Abre o portal de gerenciamento do Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testPortalSession}
                disabled={loading || currentWorkspace?.subscription_plan === SUBSCRIPTION_PLANS.ATELIER}
                className="w-full"
                variant="outline"
              >
                Abrir Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log de Testes</CardTitle>
            <CardDescription>
              Acompanhe os resultados em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm space-y-1">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground">Nenhum teste executado ainda...</p>
              ) : (
                testResults.map((result, i) => (
                  <div key={i} className={result.includes('❌') ? 'text-destructive' : ''}>
                    {result}
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setTestResults([])}
            >
              Limpar Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}