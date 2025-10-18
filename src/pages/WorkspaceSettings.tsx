import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MembersList } from "@/components/workspaces/MembersList";
import { InvitesList } from "@/components/workspaces/InvitesList";

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

        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
            <TabsTrigger value="plan">Plano</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MembersList workspaceId={currentWorkspace.id} />
          </TabsContent>

          <TabsContent value="invites">
            <InvitesList workspaceId={currentWorkspace.id} />
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>
                  Informações sobre seu plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Plano:</p>
                    <p className="text-2xl font-bold capitalize">
                      {currentWorkspace.subscription_plan}
                    </p>
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
