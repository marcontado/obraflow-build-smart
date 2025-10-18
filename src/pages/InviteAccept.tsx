import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { workspacesService } from "@/services/workspaces.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token de convite inválido");
      setLoading(false);
      return;
    }

    if (!user) {
      // Redirecionar para login com redirect de volta
      navigate(`/auth?redirect=/invite/accept?token=${token}`);
      return;
    }

    acceptInvite();
  }, [token, user]);

  const acceptInvite = async () => {
    if (!token) return;

    const { data: invite, error: acceptError } = await workspacesService.acceptInvite(token);

    if (acceptError) {
      setError(acceptError.message);
      toast({
        title: "Erro ao aceitar convite",
        description: acceptError.message,
        variant: "destructive",
      });
    } else {
      setSuccess(true);
      toast({
        title: "Convite aceito!",
        description: "Você foi adicionado ao workspace.",
      });

      // Enviar notificação aos admins
      if (invite && user) {
        await supabase.functions.invoke("send-invite-accepted-notification", {
          body: {
            workspaceId: invite.workspace_id,
            acceptedUserEmail: user.email || "",
            acceptedUserName: user.user_metadata?.full_name || user.email || "",
          },
        });
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <CardTitle>Processando convite...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {success ? (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <CardTitle>Convite Aceito!</CardTitle>
              <CardDescription>
                Você foi adicionado ao workspace com sucesso.
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle>Erro ao Aceitar Convite</CardTitle>
              <CardDescription>{error || "Ocorreu um erro desconhecido"}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => navigate("/")} className="w-full">
            {success ? "Acessar Workspace" : "Voltar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
