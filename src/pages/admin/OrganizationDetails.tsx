import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, FolderKanban, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadOrganizationDetails();
  }, [id]);

  async function loadOrganizationDetails() {
    try {
      setLoading(true);

      // Buscar organização
      const { data: orgData, error: orgError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Buscar membros
      const { data: membersData, error: membersError } = await supabase
        .from("workspace_members")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("workspace_id", id);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Buscar projetos
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, status, created_at")
        .eq("workspace_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Buscar assinatura
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("workspace_id", id)
        .single();

      if (!subError && subData) {
        setSubscription(subData);
      }
    } catch (error: any) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes da organização");
    } finally {
      setLoading(false);
    }
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      atelier: { variant: "secondary", label: "Atelier (Free)" },
      studio: { variant: "default", label: "Studio" },
      domus: { variant: "default", label: "Domus" },
    };
    const config = variants[plan] || variants.atelier;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      owner: { variant: "default", label: "Proprietário" },
      admin: { variant: "secondary", label: "Admin" },
      member: { variant: "outline", label: "Membro" },
    };
    const config = variants[role] || variants.member;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      planning: { variant: "secondary", label: "Planejamento" },
      in_progress: { variant: "default", label: "Em Andamento" },
      review: { variant: "outline", label: "Revisão" },
      completed: { variant: "outline", label: "Concluído" },
      on_hold: { variant: "secondary", label: "Pausado" },
    };
    const config = variants[status] || variants.planning;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!organization) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organização não encontrada</p>
          <Button onClick={() => navigate("/admin/organizations")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/organizations")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              {organization.slug} · Criado em{" "}
              {format(new Date(organization.created_at), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {getPlanBadge(organization.subscription_plan)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
        </div>

        {subscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Assinatura</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge>{subscription.status}</Badge>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Próxima cobrança:
                  </span>
                  <span className="text-sm">
                    {format(
                      new Date(subscription.current_period_end),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Membros da Organização</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Entrou em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profiles?.full_name || "—"}
                    </TableCell>
                    <TableCell>{member.profiles?.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      {format(new Date(member.joined_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum projeto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        {format(new Date(project.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
