import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function NotificationsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const { t } = useTranslation('settings');

  const handleSave = () => {
    toast.success(t('notifications.success'));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t('notifications.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('notifications.description')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                  {t('notifications.email.title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.email.description')}
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

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="project-updates" className="text-base font-medium cursor-pointer">
                  {t('notifications.projectUpdates.title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.projectUpdates.description')}
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

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="task-assignments" className="text-base font-medium cursor-pointer">
                  {t('notifications.taskAssignments.title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.taskAssignments.description')}
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

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="mentions" className="text-base font-medium cursor-pointer">
                  {t('notifications.mentions.title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.mentions.description')}
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

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="weekly-digest" className="text-base font-medium cursor-pointer">
                  {t('notifications.weeklyDigest.title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.weeklyDigest.description')}
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
          {t('notifications.save')}
        </Button>
      </div>
    </div>
  );
}
