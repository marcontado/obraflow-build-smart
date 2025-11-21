import { useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function PrivacyTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation('settings');

  const handleExportData = async () => {
    try {
      setExporting(true);
      toast.info(t('privacy.exportData.preparing'));
      
      // In a real implementation, this would call a backend function
      // to gather all user data and create a downloadable file
      
      toast.success(t('privacy.exportData.success'));
    } catch (error) {
      toast.error(t('profile.error'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      
      // In a real implementation, this would:
      // 1. Delete all user-created data
      // 2. Remove user from workspaces
      // 3. Delete the auth user
      // For now, we'll just sign out
      
      await supabase.auth.signOut();
      toast.success(t('privacy.deleteAccount.success'));
      navigate("/auth");
    } catch (error) {
      toast.error(t('profile.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t('privacy.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('privacy.description')}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">
              {t('privacy.exportData.title')}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('privacy.exportData.description')}
            </p>
            <Button
              onClick={handleExportData}
              disabled={exporting}
              variant="outline"
            >
              {exporting ? t('privacy.exportData.processing') : t('privacy.exportData.button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-medium text-foreground mb-2">{t('privacy.rights.title')}</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• {t('privacy.rights.access')}</li>
          <li>• {t('privacy.rights.correction')}</li>
          <li>• {t('privacy.rights.deletion')}</li>
          <li>• {t('privacy.rights.portability')}</li>
        </ul>
      </div>

      <div className="rounded-lg border border-destructive bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">
              {t('privacy.deleteAccount.title')}
            </h4>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('privacy.deleteAccount.warning')}
              </AlertDescription>
            </Alert>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  {t('privacy.deleteAccount.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('privacy.deleteAccount.confirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('privacy.deleteAccount.confirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('privacy.deleteAccount.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? t('privacy.deleteAccount.deleting') : t('privacy.deleteAccount.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
