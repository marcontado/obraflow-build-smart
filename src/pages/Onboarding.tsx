import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workspacesService } from "@/services/workspaces.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STRIPE_PRICE_IDS } from "@/constants/plans";

const workspaceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshWorkspaces, hasWorkspaces } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [step, setStep] = useState<"workspace" | "profile">("workspace");

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkipAvatar = () => {
    setStep("workspace");
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    setSubmitting(true);

    const { data: workspace, error } = await workspacesService.create(data.name);

    if (error) {
      toast({
        title: "Erro ao criar workspace",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Bem-vindo ao Archestra!",
      description: "Seu workspace foi criado com sucesso.",
    });

    // Verificar se há checkout pendente
    const pendingPlan = localStorage.getItem("pending_plan_selection");
    const skipTrialStr = localStorage.getItem("pending_skip_trial");
    const skipTrial = skipTrialStr === "true";
    
    if (pendingPlan && pendingPlan !== "atelier" && workspace) {
      try {
        // Aguardar refresh completar
        await refreshWorkspaces();
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Vamos finalizar sua assinatura...",
        });
        
        // Obter priceId correto (defaultando para mensal)
        const priceId = STRIPE_PRICE_IDS[pendingPlan as keyof typeof STRIPE_PRICE_IDS].monthly;
        
        // Criar checkout session com ou sem trial
        const { url } = await subscriptionsService.createCheckout(workspace.id, priceId, skipTrial);
        
        // Limpar localStorage
        localStorage.removeItem("pending_plan_selection");
        localStorage.removeItem("pending_skip_trial");
        
        if (url) {
          window.location.href = url;
          return;
        }
      } catch (error: any) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Erro ao criar checkout",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
        // Continuar para dashboard mesmo com erro
      }
    }

    // Aguardar refresh completar
    await refreshWorkspaces();
    
    // Redirecionar para dashboard
    navigate("/app");
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
            <CardTitle className="text-3xl">Bem-vindo ao Archestra!</CardTitle>
            <CardDescription className="text-base mt-2">
              {step === "profile" 
                ? "Personalize seu perfil (opcional)"
                : "Vamos criar seu primeiro workspace"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === "profile" ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                      Escolher Foto
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF (máx. 2MB)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSkipAvatar} variant="outline" className="flex-1">
                  Pular para Depois
                </Button>
                <Button onClick={() => setStep("workspace")} className="flex-1">
                  Continuar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do seu Workspace</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Meu Escritório, Studio Design, etc." 
                            {...field}
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={submitting} className="w-full h-11">
                    {submitting ? "Criando seu workspace..." : "Criar Workspace e Começar"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Após criar seu workspace, você será direcionado para finalizar a configuração da sua conta
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
