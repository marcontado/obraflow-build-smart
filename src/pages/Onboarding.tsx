import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workspacesService } from "@/services/workspaces.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

const workspaceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshWorkspaces } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);

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

    await refreshWorkspaces();
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
              Vamos criar seu primeiro workspace para começar a gerenciar seus projetos
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
              Você está no <strong>Plano Gratuito</strong>. Pode fazer upgrade a qualquer momento!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
