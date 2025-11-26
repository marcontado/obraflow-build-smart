import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { enviarFeedback } from "@/services/feedback.service";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function Suporte() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await enviarFeedback({
        nomeCliente: nome,
        emailCliente: email,
        mensagem: feedback
      });
      setLoading(false);
      if (result.success) {
        setFeedback("");
        setEmail("");
        setNome("");
        toast.success("Avaliação enviada! Obrigado pelo feedback.");
      } else {
        toast.error(result.message || "Erro ao enviar feedback. Tente novamente.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Erro ao enviar feedback. Tente novamente.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Suporte & Avaliação"
          subtitle="Avalie a plataforma ou entre em contato para suporte"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
        <CardHeader>
          <CardTitle>Suporte & Avaliação</CardTitle>
          <CardDescription>
            Avalie a plataforma ou entre em contato pelo WhatsApp para suporte imediato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seu nome</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                disabled={loading}
                required
                minLength={2}
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seu e-mail (opcional)</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Como você avalia a plataforma?</label>
              <Textarea
                placeholder="Deixe seu feedback, sugestão ou relato de problema..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
                minLength={5}
                maxLength={1000}
                disabled={loading}
                rows={5}
              />
            </div>
            <Button type="submit" disabled={loading || !feedback.trim()} className="w-full">
              {loading ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </form>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Ou fale direto no WhatsApp:</span>
            <a
              href="https://wa.me/5511979594378"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp: (11) 97959-4378
            </a>
          </div>
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
