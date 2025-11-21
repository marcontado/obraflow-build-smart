import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { workspacesService } from "@/services/workspaces.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export default function Onboarding() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshWorkspaces, hasWorkspaces } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);

  const workspaceSchema = z.object({
    name: z.string().min(1, t('onboarding.workspaceNameRequired')).max(100, t('onboarding.workspaceNameTooLong')),
  });

  type WorkspaceFormData = z.infer<typeof workspaceSchema>;

  // Guard: Se já tem workspace, redirecionar para /app (movido para useEffect)
  useEffect(() => {
    if (hasWorkspaces()) {
      navigate("/app", { replace: true });
    }
  }, [hasWorkspaces, navigate]);

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    setSubmitting(true);

    const { data: workspace, error } = await workspacesService.create(data.name);

    if (error) {
      toast({
        title: t('onboarding.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: t('onboarding.successTitle'),
      description: t('onboarding.successDescription'),
    });

    await refreshWorkspaces();
    
    if (workspace) {
      navigate(`/workspace/${workspace.id}/settings`);
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl">{t('onboarding.title')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('onboarding.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.workspaceName')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('onboarding.workspaceNamePlaceholder')}
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? t('onboarding.creatingButton') : t('onboarding.createButton')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center" dangerouslySetInnerHTML={{ __html: t('onboarding.planInfo') }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
