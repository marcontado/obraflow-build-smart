import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  email: string;
  workspaceName: string;
  amount: number;
  currency: string;
  invoiceUrl?: string;
  type: 'success' | 'failed';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, workspaceName, amount, currency, invoiceUrl, type }: InvoiceEmailRequest = await req.json();

    const isSuccess = type === 'success';
    const subject = isSuccess 
      ? `✅ Pagamento Confirmado - ${workspaceName}`
      : `⚠️ Falha no Pagamento - ${workspaceName}`;

    const html = isSuccess 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Pagamento Confirmado! ✅</h1>
          <p>Olá,</p>
          <p>Confirmamos o recebimento do seu pagamento para o workspace <strong>${workspaceName}</strong>.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Valor:</strong> ${currency.toUpperCase()} ${amount.toFixed(2)}</p>
          </div>
          
          ${invoiceUrl ? `
            <p>
              <a href="${invoiceUrl}" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Download da Fatura (PDF)
              </a>
            </p>
          ` : ''}
          
          <p>Obrigado por continuar conosco!</p>
          <p style="color: #666; font-size: 14px;">Archestra</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Falha no Pagamento ⚠️</h1>
          <p>Olá,</p>
          <p>Não conseguimos processar o pagamento para o workspace <strong>${workspaceName}</strong>.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Valor:</strong> ${currency.toUpperCase()} ${amount.toFixed(2)}</p>
            <p style="margin: 8px 0 0 0;">Por favor, atualize suas informações de pagamento para continuar utilizando os recursos premium.</p>
          </div>
          
          <p>
            <a href="${Deno.env.get('SUPABASE_URL')}/workspace/settings?tab=subscription" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Atualizar Método de Pagamento
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">Se você tiver dúvidas, entre em contato conosco.</p>
          <p style="color: #666; font-size: 14px;">Archestra</p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Archestra <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);