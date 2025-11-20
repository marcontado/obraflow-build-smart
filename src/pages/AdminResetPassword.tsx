import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminAuthService } from "@/services/admin-auth.service";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

export default function AdminResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setLoading(true);
    try {
      await adminAuthService.adminResetPassword(email);
      setEmailSent(true);
      toast.success("Se você for um administrador autorizado, receberá um email com instruções");
    } catch (error: any) {
      console.error("Erro ao solicitar reset:", error);
      toast.success("Se você for um administrador autorizado, receberá um email com instruções");
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Recuperar Senha Admin
          </CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? "Verifique seu email"
              : "Insira seu email de administrador"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Se você for um administrador autorizado, receberá um email com instruções para redefinir sua senha.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>

              <Link to="/admin/login">
                <Button variant="ghost" className="w-full" type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Se você for um administrador autorizado, receberá um email com um link para redefinir sua senha.
              </p>
              <p className="text-xs text-muted-foreground">
                O link expira em 1 hora por questões de segurança.
              </p>
              <Link to="/admin/login">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
