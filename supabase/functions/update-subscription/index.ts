import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getPlanFromProductId } from "../_shared/plan-mapping.ts";

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

    console.log('📝 Update subscription request:', { workspaceId, priceId });

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

    // Get product ID from the updated subscription
    const productId = updatedSubscription.items.data[0]?.price.product as string;
    
    // Determine new plan using Product ID (primary method)
    const plan = getPlanFromProductId(productId);
    
    if (!plan) {
      console.error(`❌ CRITICAL: Unknown product_id: ${productId} - Cannot determine plan`);
      throw new Error(`Unknown product ID: ${productId}. Please contact support.`);
    }

    console.log('✅ Updating subscription:', { priceId, productId, plan });

    // Update workspace plan using service role for reliable updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    await supabaseAdmin
      .from('workspaces')
      .update({ subscription_plan: plan })
      .eq('id', workspaceId);

    // Update subscription record
    await supabaseAdmin
      .from('subscriptions')
      .update({
        stripe_price_id: priceId,
        status: updatedSubscription.status,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      })
      .eq('workspace_id', workspaceId);

    console.log('✅ Subscription and workspace updated successfully');

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
    console.error('❌ Error updating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
