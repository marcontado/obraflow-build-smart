import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubscriptionMetrics } from "@/components/admin/SubscriptionMetrics";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await adminService.getSubscriptions();
      setSubscriptions(data.subscriptions || []);
      setMetrics(data.metrics || {});
    } catch (error: any) {
      console.error("Erro ao carregar assinaturas:", error);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: "default", label: "Ativa" },
      canceled: { variant: "secondary", label: "Cancelada" },
      past_due: { variant: "destructive", label: "Vencida" },
      incomplete: { variant: "outline", label: "Incompleta" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">Visão geral de assinaturas e receita</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            {metrics && (
              <SubscriptionMetrics
                totalMRR={metrics.totalMRR || 0}
                atelierCount={metrics.atelierCount || 0}
                studioCount={metrics.studioCount || 0}
                domusCount={metrics.domusCount || 0}
                activeSubscriptions={metrics.activeSubscriptions || 0}
              />
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organização</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Próxima Cobrança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Nenhuma assinatura encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.workspace?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sub.workspace?.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell>
                          {sub.current_period_start
                            ? format(
                                new Date(sub.current_period_start),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {sub.current_period_end
                            ? format(
                                new Date(sub.current_period_end),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
