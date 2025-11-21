import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, CreditCard, Receipt } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceGeneralSettings } from "@/components/workspaces/WorkspaceGeneralSettings";
import { MembersList } from "@/components/workspaces/MembersList";
import { InvitesList } from "@/components/workspaces/InvitesList";
import { SubscriptionManager } from "@/components/subscriptions/SubscriptionManager";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useUserRole } from "@/hooks/useUserRole";
import { PLAN_LIMITS } from "@/constants/plans";

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { canChangeSettings, canManageMembers, canManageBilling, loading } = useUserRole();

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.id !== workspaceId) {
      navigate("/workspace/select");
    }
  }, [currentWorkspace, workspaceId, navigate]);

  useEffect(() => {
    if (!loading && !canChangeSettings) {
      navigate("/");
    }
  }, [canChangeSettings, loading, navigate]);

  if (!currentWorkspace) {
    return <div className="flex items-center justify-center h-screen">Workspace não encontrado</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const planLimits = PLAN_LIMITS[currentWorkspace.subscription_plan];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Configurações" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Configurações do Workspace</h1>
                <p className="text-muted-foreground">{currentWorkspace.name}</p>
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Geral</span>
                  </TabsTrigger>
                  {canManageMembers && (
                    <TabsTrigger value="members" className="gap-2">
                      <Users className="h-4 w-4" />
                      <span>Membros</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="plan" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Plano</span>
                  </TabsTrigger>
                  {canManageBilling && (
                    <TabsTrigger value="subscription" className="gap-2">
                      <Receipt className="h-4 w-4" />
                      <span>Assinatura</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <Card className="border-border bg-card">
                  <TabsContent value="general" className="m-0">
                    <WorkspaceGeneralSettings workspaceId={currentWorkspace.id} />
                  </TabsContent>

                  {canManageMembers && (
                    <TabsContent value="members" className="m-0">
                      <Tabs defaultValue="list" className="w-full">
                        <div className="border-b px-6 pt-6">
                          <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="list">Membros Ativos</TabsTrigger>
                            <TabsTrigger value="invites">Convites Pendentes</TabsTrigger>
                          </TabsList>
                        </div>
                        
                        <TabsContent value="list" className="mt-0">
                          <MembersList workspaceId={currentWorkspace.id} />
                        </TabsContent>
                        
                        <TabsContent value="invites" className="mt-0">
                          <InvitesList workspaceId={currentWorkspace.id} />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  )}

                  <TabsContent value="plan" className="m-0 p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">Plano Atual</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {currentWorkspace.subscription_plan}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Limites do Plano</h4>
                        <div className="grid gap-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <span className="text-sm text-muted-foreground">Projetos Ativos</span>
                            <span className="text-sm font-medium">
                              {planLimits.activeProjects === Infinity ? "Ilimitado" : planLimits.activeProjects}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <span className="text-sm text-muted-foreground">Membros</span>
                            <span className="text-sm font-medium">
                              {planLimits.membersPerWorkspace === Infinity ? "Ilimitado" : planLimits.membersPerWorkspace}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <span className="text-sm text-muted-foreground">Clientes</span>
                            <span className="text-sm font-medium">
                              {planLimits.maxClients === Infinity ? "Ilimitado" : planLimits.maxClients}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Recursos Disponíveis</h4>
                        <div className="grid gap-2">
                          {Object.entries(planLimits.features).map(([key, enabled]) => (
                            <div key={key} className="flex items-center gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`} />
                              <span className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {canManageBilling && (
                    <TabsContent value="subscription" className="m-0">
                      <SubscriptionManager workspaceId={currentWorkspace.id} />
                    </TabsContent>
                  )}
                </Card>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
