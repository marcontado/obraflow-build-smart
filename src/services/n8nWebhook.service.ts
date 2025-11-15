export async function sendN8nWebhook({ nome, email, mensagem }: { nome?: string; email?: string; mensagem: string }) {
  const webhookUrl = "https://matweber.app.n8n.cloud/webhook/2a2aa117-e409-42da-a076-19515fd5e117";
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, mensagem }),
    });``
    if (!res.ok) throw new Error("Erro ao enviar webhook");
    return true;
  } catch (err) {
    return false;
  }
}
