import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export default function Suporte() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFeedback("");
      setEmail("");
      toast.success("Avaliação enviada! Obrigado pelo feedback.");
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
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
  );
}
