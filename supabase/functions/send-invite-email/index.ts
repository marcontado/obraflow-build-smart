import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, workspaceName, inviterName, role, inviteLink }: InviteEmailRequest = await req.json();

    console.log("Sending invite email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Workspace <onboarding@resend.dev>",
      to: [email],
      subject: `Convite para ${workspaceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Você foi convidado!</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${inviterName}</strong> convidou você para fazer parte do workspace 
            <strong>${workspaceName}</strong> como <strong>${role === 'admin' ? 'Administrador' : role === 'owner' ? 'Proprietário' : 'Membro'}</strong>.
          </p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Aceitar Convite
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            Este convite expira em 7 dias.
          </p>
          <p style="font-size: 14px; color: #888;">
            Se você não esperava este convite, pode ignorar este e-mail com segurança.
          </p>
        </div>
      `,
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
    console.error("Error in send-invite-email function:", error);
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
