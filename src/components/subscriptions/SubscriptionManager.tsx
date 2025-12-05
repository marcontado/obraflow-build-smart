import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Download, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { subscriptionsService } from "@/services/subscriptions.service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubscriptionManagerProps {
  workspaceId: string;
}

export function SubscriptionManager({ workspaceId }: SubscriptionManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsService.getSubscription(workspaceId);
      setSubscription(data.subscription);
      setInvoices(data.invoices || []);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Erro ao carregar assinatura",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [workspaceId]);

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      const result = await subscriptionsService.cancelSubscription(workspaceId);

      if (subscription?.stripe_subscription_id) {
        await subscriptionsService.cancelSubscriptionOnBackend(subscription.stripe_subscription_id);
      }

      await fetch("https://archestra-backend.onrender.com/send-cancel-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscription?.customer_email,
          name: subscription?.customer_name || "Cliente",
        }),
      });

      toast({
        title: "Assinatura cancelada",
        description: `Sua assinatura será cancelada em ${format(new Date(result.cancel_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
      });

      await loadSubscription();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setCanceling(true);
      await subscriptionsService.reactivateSubscription(workspaceId);

      if (subscription?.stripe_subscription_id) {
        await subscriptionsService.updateSubscriptionOnBackend({
          subscriptionId: subscription.stripe_subscription_id,
          plan: subscription.plan,
          status: "active",
        });
      }

      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura continuará ativa no próximo período",
      });

      await loadSubscription();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Erro ao reativar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleManagePayment = async () => {
    try {
      const { url } = await subscriptionsService.createPortalSession(workspaceId);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Erro ao abrir portal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.stripe_subscription_id) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Nenhuma assinatura ativa
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      active: { label: "Ativa", variant: "default" },
      canceled: { label: "Cancelada", variant: "destructive" },
      past_due: { label: "Atrasada", variant: "destructive" },
      incomplete: { label: "Incompleta", variant: "secondary" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Detalhes da Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <div className="mt-1">{getStatusBadge(subscription.status)}</div>
            </div>
            {subscription.current_period_end && (
              <div className="text-right">
                <p className="text-sm font-medium">Próxima cobrança</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(subscription.current_period_end), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {subscription.cancel_at_period_end && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sua assinatura será cancelada em{" "}
                {format(new Date(subscription.current_period_end), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleManagePayment}
            >
              Gerenciar Pagamento
            </Button>

            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Cancelar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sua assinatura será cancelada no final do período de cobrança atual.
                      Você continuará tendo acesso aos recursos até lá.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {canceling ? "Cancelando..." : "Sim, Cancelar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {subscription.cancel_at_period_end && (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={handleReactivateSubscription}
                disabled={canceling}
              >
                {canceling ? "Reativando..." : "Manter Assinatura"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Suas faturas e recibos recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {invoice.currency.toUpperCase()} {invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.created), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    {invoice.invoice_pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
