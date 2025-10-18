import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { MembersList } from "@/components/workspaces/MembersList";
import { InvitesList } from "@/components/workspaces/InvitesList";
import { WorkspaceGeneralSettings } from "@/components/workspaces/WorkspaceGeneralSettings";
import { PLAN_NAMES, PLAN_LIMITS } from "@/constants/plans";

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace || currentWorkspace.id !== id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Workspace não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurações do Workspace</h1>
            <p className="text-muted-foreground">{currentWorkspace.name}</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
            <TabsTrigger value="plan">Plano</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <WorkspaceGeneralSettings workspaceId={currentWorkspace.id} />
          </TabsContent>

          <TabsContent value="members">
            <MembersList workspaceId={currentWorkspace.id} />
          </TabsContent>

          <TabsContent value="invites">
            <InvitesList workspaceId={currentWorkspace.id} />
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Plano Atual
                  <Badge variant="default" className="text-sm">
                    {PLAN_NAMES[currentWorkspace.subscription_plan as keyof typeof PLAN_NAMES]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Informações e limites do seu plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Workspaces</p>
                      <p className="text-2xl font-bold">
                        {PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].workspaces === Infinity 
                          ? "Ilimitado" 
                          : PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].workspaces}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Membros por Workspace</p>
                      <p className="text-2xl font-bold">
                        {PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].membersPerWorkspace === Infinity 
                          ? "Ilimitado" 
                          : PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].membersPerWorkspace}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Projetos Ativos</p>
                      <p className="text-2xl font-bold">
                        {PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].activeProjects === Infinity 
                          ? "Ilimitado" 
                          : PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].activeProjects}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Clientes</p>
                      <p className="text-2xl font-bold">
                        {PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].maxClients === Infinity 
                          ? "Ilimitado" 
                          : PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].maxClients}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Recursos Disponíveis</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(PLAN_LIMITS[currentWorkspace.subscription_plan as keyof typeof PLAN_LIMITS].features).map(([key, enabled]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                            {enabled ? "✓" : "✗"}
                          </Badge>
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
