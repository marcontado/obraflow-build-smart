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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export function SecurityTab() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      reset();
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Segurança</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie sua senha e configurações de segurança
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Alterar Senha</h4>
            <p className="text-sm text-muted-foreground">
              Recomendamos usar uma senha forte e única que você não use em outros sites
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha Atual</Label>
          <PasswordInput
            id="currentPassword"
            {...register("currentPassword")}
            placeholder="Digite sua senha atual"
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <PasswordInput
            id="newPassword"
            {...register("newPassword")}
            placeholder="Digite sua nova senha"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
          <PasswordStrength password={watchNewPassword} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <PasswordInput
            id="confirmPassword"
            {...register("confirmPassword")}
            placeholder="Confirme sua nova senha"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Alterar Senha
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-medium text-foreground mb-2">Sessões Ativas</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade em desenvolvimento. Em breve você poderá ver e gerenciar todas as suas sessões ativas.
        </p>
      </div>
    </div>
  );
}
