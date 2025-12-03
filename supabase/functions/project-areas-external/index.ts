import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("EXTERNAL_API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error("Invalid or missing API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, id, data } = body;

    console.log(`[project-areas-external] Action: ${action}, ID: ${id || "N/A"}`);

    let result;

    switch (action) {
      case "create": {
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Missing 'data' for create action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const insertData: Record<string, unknown> = {
          name: data.name,
          description: data.description || null,
          budget: data.budget || null,
          project_id: data.project_id,
          workspace_id: data.workspace_id,
        };

        // Allow external service to set custom ID
        if (data.id) {
          insertData.id = data.id;
        }

        const { data: created, error } = await supabase
          .from("project_areas")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("[project-areas-external] Create error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[project-areas-external] Created project area: ${created.id}`);
        result = { success: true, data: created };
        break;
      }

      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing 'id' for update action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!data) {
          return new Response(
            JSON.stringify({ error: "Missing 'data' for update action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: updated, error } = await supabase
          .from("project_areas")
          .update(data)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("[project-areas-external] Update error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[project-areas-external] Updated project area: ${id}`);
        result = { success: true, data: updated };
        break;
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing 'id' for delete action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("project_areas")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("[project-areas-external] Delete error:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[project-areas-external] Deleted project area: ${id}`);
        result = { success: true, deleted: id };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Use 'create', 'update', or 'delete'.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[project-areas-external] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
