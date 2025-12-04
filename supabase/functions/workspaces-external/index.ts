import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data, id } = await req.json();
    console.log(`Workspaces external action: ${action}`, { id, data });

    let result;

    switch (action) {
      case "create": {
        if (!data || !data.name || !data.created_by) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: name, created_by" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate slug if not provided
        const slug = data.slug || data.name.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const insertData = {
          id: data.id || undefined,
          name: data.name,
          slug: slug,
          subscription_plan: data.subscription_plan || "atelier",
          created_by: data.created_by,
          logo_url: data.logo_url || null,
        };

        const { data: workspace, error } = await supabase
          .from("workspaces")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error creating workspace:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Also create workspace_member entry for the owner
        if (workspace) {
          const { error: memberError } = await supabase
            .from("workspace_members")
            .insert({
              workspace_id: workspace.id,
              user_id: data.created_by,
              role: "owner",
            });

          if (memberError) {
            console.error("Error creating workspace member:", memberError);
          }
        }

        result = workspace;
        break;
      }

      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing workspace id for update" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.subscription_plan !== undefined) updateData.subscription_plan = data.subscription_plan;
        if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;

        const { data: workspace, error } = await supabase
          .from("workspaces")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating workspace:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = workspace;
        break;
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing workspace id for delete" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("workspaces")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting workspace:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { deleted: true, id };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Valid actions: create, update, delete` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Workspaces external ${action} completed successfully`);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Workspaces external error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
