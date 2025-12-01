import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar API key
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('EXTERNAL_API_KEY');
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();
    console.log(`External tasks action: ${action}`, data);

    let result;

    switch (action) {
      case 'create':
        const { data: createData, error: createError } = await supabase
          .from('tasks')
          .insert(data)
          .select()
          .single();

        if (createError) throw createError;
        result = createData;
        console.log(`Task created via external API: ${createData.id}`);
        break;

      case 'update':
        const { id, updates } = data;
        const { data: updateData, error: updateError } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = updateData;
        console.log(`Task updated via external API: ${id}`);
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        console.log(`Task deleted via external API: ${data.id}`);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in tasks-external function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
