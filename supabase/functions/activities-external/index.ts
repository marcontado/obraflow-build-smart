import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
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
        JSON.stringify({ error: "Unauthorized - Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, id, data } = body;

    console.log(`Activities External - Action: ${action}, ID: ${id || "N/A"}`);

    switch (action) {
      case "create": {
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Missing data for create action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate required fields
        const requiredFields = ["name", "start_date", "end_date", "project_id", "workspace_id"];
        for (const field of requiredFields) {
          if (!data[field]) {
            return new Response(
              JSON.stringify({ error: `Missing required field: ${field}` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        const { data: activity, error } = await supabase
          .from("project_activities")
          .insert({
            id: data.id || undefined,
            name: data.name,
            description: data.description || null,
            start_date: data.start_date,
            end_date: data.end_date,
            progress: data.progress || 0,
            priority: data.priority || "medium",
            project_id: data.project_id,
            workspace_id: data.workspace_id,
            task_id: data.task_id || null,
            dependencies: data.dependencies || [],
            created_by: data.created_by || null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating activity:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Activity created successfully:", activity.id);
        return new Response(
          JSON.stringify({ success: true, data: activity }),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for update action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!data || Object.keys(data).length === 0) {
          return new Response(
            JSON.stringify({ error: "Missing data for update action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: activity, error } = await supabase
          .from("project_activities")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating activity:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Activity updated successfully:", id);
        return new Response(
          JSON.stringify({ success: true, data: activity }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Missing id for delete action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("project_activities")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting activity:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Activity deleted successfully:", id);
        return new Response(
          JSON.stringify({ success: true, message: "Activity deleted" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Valid actions: create, update, delete` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
