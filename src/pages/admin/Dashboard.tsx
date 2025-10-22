import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricCard } from "@/components/admin/MetricCard";
import { adminService } from "@/services/admin.service";
import { Building2, Users, FolderKanban, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading admin stats:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Visão geral da plataforma</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Archestra</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Organizações"
            value={stats?.totalWorkspaces || 0}
            description={`Atelier: ${stats?.workspacesByPlan?.atelier || 0} | Studio: ${stats?.workspacesByPlan?.studio || 0} | Domus: ${stats?.workspacesByPlan?.domus || 0}`}
            icon={Building2}
          />

          <MetricCard
            title="Total de Usuários"
            value={stats?.totalUsers || 0}
            description={`${stats?.newUsers || 0} novos nos últimos 30 dias`}
            icon={Users}
            trend={stats?.newUsers ? { value: Math.round((stats.newUsers / stats.totalUsers) * 100), isPositive: true } : undefined}
          />

          <MetricCard
            title="Projetos"
            value={stats?.totalProjects || 0}
            description={`${stats?.activeProjects || 0} ativos`}
            icon={FolderKanban}
          />

          <MetricCard
            title="Receita Mensal"
            value={`R$ ${stats?.monthlyRevenue?.toLocaleString('pt-BR') || 0}`}
            description={`${stats?.activeSubscriptions || 0} assinaturas ativas`}
            icon={DollarSign}
          />
        </div>

        {/* Breakdown por Planos */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Plano Atelier"
            value={stats?.workspacesByPlan?.atelier || 0}
            description="Gratuito"
            icon={Building2}
            className="border-l-4 border-l-muted"
          />

          <MetricCard
            title="Plano Studio"
            value={stats?.workspacesByPlan?.studio || 0}
            description="R$ 149/mês"
            icon={TrendingUp}
            className="border-l-4 border-l-primary"
          />

          <MetricCard
            title="Plano Domus"
            value={stats?.workspacesByPlan?.domus || 0}
            description="R$ 399/mês"
            icon={TrendingUp}
            className="border-l-4 border-l-secondary"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
