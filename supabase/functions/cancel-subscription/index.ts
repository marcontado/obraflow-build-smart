import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { workspaceId } = await req.json();

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    console.log('Canceling subscription for workspace:', workspaceId);

    // Verify user is workspace owner
    const { data: member } = await supabaseClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'owner') {
      throw new Error('Only workspace owners can cancel subscriptions');
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (subError || !subscription || !subscription.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    console.log('Canceling Stripe subscription:', subscription.stripe_subscription_id);

    // Cancel at period end (not immediately)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update local record
    await supabaseClient
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('workspace_id', workspaceId);

    console.log('Subscription will cancel at:', new Date(updatedSubscription.current_period_end * 1000));

    return new Response(
      JSON.stringify({
        message: 'Subscription will be canceled at the end of the billing period',
        cancel_at: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
