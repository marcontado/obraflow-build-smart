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

    const { workspaceId, priceId } = await req.json();

    if (!workspaceId || !priceId) {
      throw new Error('workspaceId and priceId are required');
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

    // Get current subscription
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_price_id')
      .eq('workspace_id', workspaceId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    // Get subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      }
    );

    // Determine new plan
    let plan = 'atelier';
    if (priceId.includes('Studio') || priceId === 'price_1SJo9VR2sSXsKMlD3JF3b9ti' || priceId === 'price_1SJoJpR2sSXsKMlDgwa3VuZ9') {
      plan = 'studio';
    } else if (priceId.includes('Domus') || priceId === 'price_1SJo9VR2sSXsKMlDMXxkrEAE' || priceId === 'price_1SJoKdR2sSXsKMlDb1Vu6m6F') {
      plan = 'domus';
    }

    // Update workspace plan
    await supabaseClient
      .from('workspaces')
      .update({ subscription_plan: plan })
      .eq('id', workspaceId);

    // Update subscription record
    await supabaseClient
      .from('subscriptions')
      .update({
        stripe_price_id: priceId,
        status: updatedSubscription.status,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      })
      .eq('workspace_id', workspaceId);

    return new Response(
      JSON.stringify({ 
        success: true,
        plan,
        subscription: updatedSubscription 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});