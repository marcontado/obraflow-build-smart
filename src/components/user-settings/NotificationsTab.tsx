import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NotificationsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = () => {
    toast.success("Preferências de notificação salvas!");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
        <p className="text-sm text-muted-foreground">
          Configure como você deseja receber notificações
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                  Notificações por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações importantes por email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>

        {/* Project Updates */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="project-updates" className="text-base font-medium cursor-pointer">
                  Atualizações de Projetos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando um projeto for atualizado
                </p>
              </div>
            </div>
            <Switch
              id="project-updates"
              checked={projectUpdates}
              onCheckedChange={setProjectUpdates}
            />
          </div>
        </div>

        {/* Task Assignments */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="task-assignments" className="text-base font-medium cursor-pointer">
                  Atribuições de Tarefas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando uma tarefa for atribuída a você
                </p>
              </div>
            </div>
            <Switch
              id="task-assignments"
              checked={taskAssignments}
              onCheckedChange={setTaskAssignments}
            />
          </div>
        </div>

        {/* Mentions */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="mentions" className="text-base font-medium cursor-pointer">
                  Menções
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando você for mencionado em comentários
                </p>
              </div>
            </div>
            <Switch
              id="mentions"
              checked={mentions}
              onCheckedChange={setMentions}
            />
          </div>
        </div>

        {/* Weekly Digest */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="weekly-digest" className="text-base font-medium cursor-pointer">
                  Resumo Semanal
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo semanal das atividades do workspace
                </p>
              </div>
            </div>
            <Switch
              id="weekly-digest"
              checked={weeklyDigest}
              onCheckedChange={setWeeklyDigest}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
}
