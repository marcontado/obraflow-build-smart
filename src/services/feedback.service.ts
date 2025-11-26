export async function enviarFeedback({ nomeCliente, emailCliente, mensagem }: {
  nomeCliente: string;
  emailCliente?: string;
  mensagem: string;
}) {
  const response = await fetch('https://txw8hxk0o8.execute-api.us-east-1.amazonaws.com/PROD/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeCliente, emailCliente, mensagem })
  });
  return await response.json();
}