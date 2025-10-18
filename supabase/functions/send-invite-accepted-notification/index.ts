import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  workspaceId: string;
  acceptedUserEmail: string;
  acceptedUserName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, acceptedUserEmail, acceptedUserName }: NotificationRequest = await req.json();

    console.log("Sending acceptance notification for workspace:", workspaceId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar admins e owners do workspace
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(`
        user_id,
        role,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq("workspace_id", workspaceId)
      .in("role", ["admin", "owner"]);

    if (membersError) {
      throw new Error(`Error fetching members: ${membersError.message}`);
    }

    // Buscar informações do workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      throw new Error(`Error fetching workspace: ${workspaceError.message}`);
    }

    // Enviar e-mail para cada admin/owner
    const emailPromises = members.map(async (member: any) => {
      const adminEmail = member.profiles.email;
      const adminName = member.profiles.full_name || "Admin";

      return resend.emails.send({
        from: "Workspace <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Novo membro no ${workspace.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Novo membro adicionado</h1>
            <p style="font-size: 16px; color: #555;">
              Olá <strong>${adminName}</strong>,
            </p>
            <p style="font-size: 16px; color: #555;">
              <strong>${acceptedUserName || acceptedUserEmail}</strong> aceitou o convite e agora faz parte do workspace 
              <strong>${workspace.name}</strong>.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              Este é um e-mail automático de notificação.
            </p>
          </div>
        `,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful,
        failed: failed 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite-accepted-notification function:", error);
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
