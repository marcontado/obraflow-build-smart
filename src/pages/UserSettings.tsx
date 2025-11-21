import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Building2, Bell, Palette, Activity, Shield } from "lucide-react";
import { ProfileTab } from "@/components/user-settings/ProfileTab";
import { SecurityTab } from "@/components/user-settings/SecurityTab";
import { WorkspaceTab } from "@/components/user-settings/WorkspaceTab";
import { NotificationsTab } from "@/components/user-settings/NotificationsTab";
import { AppearanceTab } from "@/components/user-settings/AppearanceTab";
import { ActivityTab } from "@/components/user-settings/ActivityTab";
import { PrivacyTab } from "@/components/user-settings/PrivacyTab";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Configurações" subtitle="Gerencie suas preferências e informações pessoais" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 lg:w-auto">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="workspace" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Workspace</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Aparência</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Atividade</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacidade</span>
                </TabsTrigger>
              </TabsList>

              <Card className="border-border bg-card">
                <TabsContent value="profile" className="mt-0">
                  <ProfileTab />
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <SecurityTab />
                </TabsContent>
                
                <TabsContent value="workspace" className="mt-0">
                  <WorkspaceTab />
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <NotificationsTab />
                </TabsContent>
                
                <TabsContent value="appearance" className="mt-0">
                  <AppearanceTab />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0">
                  <ActivityTab />
                </TabsContent>
                
                <TabsContent value="privacy" className="mt-0">
                  <PrivacyTab />
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
