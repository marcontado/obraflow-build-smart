import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/schemas/password.schema";
import { useTranslation } from "react-i18next";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export function SecurityTab() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { t, ready } = useTranslation('settings');

  if (!ready) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const watchNewPassword = watch("newPassword", "");

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success(t('security.changePassword.success'));
      reset();
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || t('security.changePassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t('security.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('security.description')}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">{t('security.changePassword.title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('security.changePassword.description')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t('security.changePassword.current')}</Label>
          <PasswordInput
            id="currentPassword"
            {...register("currentPassword")}
            placeholder={t('security.changePassword.currentPlaceholder')}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('security.changePassword.new')}</Label>
          <PasswordInput
            id="newPassword"
            {...register("newPassword")}
            placeholder={t('security.changePassword.newPlaceholder')}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
          <PasswordStrength password={watchNewPassword} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('security.changePassword.confirm')}</Label>
          <PasswordInput
            id="confirmPassword"
            {...register("confirmPassword")}
            placeholder={t('security.changePassword.confirmPlaceholder')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('security.changePassword.button')}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-medium text-foreground mb-2">{t('security.sessions.title')}</h4>
        <p className="text-sm text-muted-foreground mb-4">
          {t('security.sessions.description')}
        </p>
      </div>
    </div>
  );
}
