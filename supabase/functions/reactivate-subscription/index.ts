import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { workspaceId } = await req.json();

    if (!workspaceId) {
      throw new Error('workspaceId is required');
    }

    // Verify user is workspace owner or admin
    const { data: membership } = await supabaseClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new Error('Not authorized');
    }

    // Get subscription
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id, cancel_at_period_end')
      .eq('workspace_id', workspaceId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    if (!subscription.cancel_at_period_end) {
      throw new Error('Subscription is not scheduled for cancellation');
    }

    // Reactivate subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update database
    await supabaseClient
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
      })
      .eq('workspace_id', workspaceId);

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: updatedSubscription 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});