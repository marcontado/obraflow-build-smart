import { useState, useEffect } from "react";
import { Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Sidebar } from "@/components/layout/Sidebar";

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <span className="text-lg text-muted-foreground font-medium">{displayed}</span>
  );
}

export default function Chat() {
  const { currentWorkspace } = useWorkspace();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    // Adiciona a mensagem do usuário imediatamente
    setMessages((msgs) => {
      const updated = [...msgs, userMessage];
      return updated;
    });
    setInput(""); // limpa o input imediatamente
    setLoading(true);
    try {
      const response = await fetch("https://archestra-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: currentWorkspace?.id,
          question: input
        }),
      });
      const data = await response.json();
      // Adiciona a resposta da IA ao final das mensagens já atualizadas
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.answer }
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Erro ao obter resposta da IA." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col h-full py-8">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-6 justify-center">
            <Zap className="text-purple-600" /> Chat IA do Workspace
          </h2>
          <div className="flex-1 overflow-y-auto px-2">
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-80">
                <TypingText text="Olá, o que posso te ajudar hoje?" />
              </div>
            )}
            {messages.length > 0 && (
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] shadow
                        ${msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-900 border"}
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-white border text-gray-900 max-w-[80%] shadow animate-pulse">
                      IA está pensando...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <form
            className="flex gap-2 mt-6"
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="flex-1 border rounded px-3 py-2 bg-background"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={loading}
              autoFocus
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4 mr-2" /> Enviar
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}