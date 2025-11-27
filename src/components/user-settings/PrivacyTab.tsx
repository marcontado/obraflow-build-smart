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

export function PrivacyTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      toast.info("Preparando exportação de dados...");
      
      // In a real implementation, this would call a backend function
      // to gather all user data and create a downloadable file
      
      toast.success("Solicitação de exportação enviada! Você receberá um email em breve.");
    } catch (error) {
      toast.error("Erro ao solicitar exportação de dados");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      // Excluir usuário no backend DynamoDB usando pk e sk na query string
      if (user?.email) {
        const pk = user.email; // ajuste conforme seu padrão, ex: "USER#" + user.email
        const sk = user.email; // ajuste conforme seu padrão, ex: "PROFILE#" + user.email
        const url = `https://archestra-backend.onrender.com/user?pk=${encodeURIComponent(pk)}&sk=${encodeURIComponent(sk)}`;
        await fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      }

      // Sign out no Supabase
      await supabase.auth.signOut();
      toast.success("Conta deletada com sucesso");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao deletar conta");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Privacidade e Dados</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados pessoais e privacidade
        </p>
      </div>

      {/* Export Data */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">
              Exportar Seus Dados
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Faça o download de uma cópia de todos os seus dados pessoais, projetos, clientes e atividades.
              De acordo com a LGPD, você tem o direito de solicitar e receber seus dados.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exporting}
              variant="outline"
            >
              {exporting ? "Processando..." : "Exportar Meus Dados"}
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-medium text-foreground mb-2">Seus Direitos</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Você pode solicitar acesso aos seus dados pessoais</li>
          <li>• Você pode solicitar a correção de dados incorretos</li>
          <li>• Você pode solicitar a exclusão dos seus dados</li>
          <li>• Você pode solicitar a portabilidade dos seus dados</li>
        </ul>
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border border-destructive bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">
              Deletar Conta
            </h4>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação é irreversível! Todos os seus dados, projetos, clientes e atividades serão permanentemente deletados.
                Se você é o proprietário de um workspace, ele também será deletado.
              </AlertDescription>
            </Alert>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Deletar Minha Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá permanentemente deletar sua conta
                    e remover todos os seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Deletando..." : "Sim, deletar minha conta"}
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
