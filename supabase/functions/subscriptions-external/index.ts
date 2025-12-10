import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('EXTERNAL_API_KEY');

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, id, data } = await req.json();

    console.log(`Subscriptions external - Action: ${action}, ID: ${id}`);

    let result;

    switch (action) {
      case 'create': {
        if (!data || !data.workspace_id) {
          return new Response(
            JSON.stringify({ error: 'Missing required field: workspace_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Build insert object with only provided fields
        const insertObject: Record<string, unknown> = {
          workspace_id: data.workspace_id,
          status: data.status || 'incomplete',
          cancel_at_period_end: data.cancel_at_period_end || false,
        };

        // Add optional fields if provided
        if (data.id) insertObject.id = data.id;
        if (data.stripe_customer_id) insertObject.stripe_customer_id = data.stripe_customer_id;
        if (data.stripe_subscription_id) insertObject.stripe_subscription_id = data.stripe_subscription_id;
        if (data.stripe_price_id) insertObject.stripe_price_id = data.stripe_price_id;
        if (data.current_period_start) insertObject.current_period_start = data.current_period_start;
        if (data.current_period_end) insertObject.current_period_end = data.current_period_end;

        console.log('Creating subscription with data:', insertObject);

        const { data: insertedData, error: insertError } = await supabase
          .from('subscriptions')
          .insert(insertObject)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscription:', insertError);
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = insertedData;
        console.log('Subscription created:', result.id);
        break;
      }

      case 'update': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Missing subscription ID for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: updatedData, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = updatedData;
        console.log('Subscription updated:', result.id);
        break;
      }

      case 'delete': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Missing subscription ID for delete' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting subscription:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = { deleted: true, id };
        console.log('Subscription deleted:', id);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: create, update, delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Subscriptions external error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
