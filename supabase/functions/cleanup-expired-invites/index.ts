import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting cleanup of expired invites...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Deletar convites expirados e não aceitos
    const { data, error } = await supabase
      .from("workspace_invites")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .is("accepted_at", null)
      .select();

    if (error) {
      throw new Error(`Error deleting expired invites: ${error.message}`);
    }

    const deletedCount = data?.length || 0;
    console.log(`Cleanup completed. Deleted ${deletedCount} expired invites.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: deletedCount,
        message: `Successfully deleted ${deletedCount} expired invites` 
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
    console.error("Error in cleanup-expired-invites function:", error);
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
