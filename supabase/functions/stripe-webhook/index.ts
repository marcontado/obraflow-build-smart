import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return new Response('Webhook signature or secret missing', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log('Webhook event received:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspace_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!workspaceId) {
          console.error('No workspace_id in session metadata');
          break;
        }

        console.log('Checkout completed:', { workspaceId, subscriptionId });

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        // Determine plan from price ID
        let plan = 'atelier';
        if (priceId?.includes('Studio') || priceId === 'price_1SJo9VR2sSXsKMlD3JF3b9ti' || priceId === 'price_1SJoJpR2sSXsKMlDgwa3VuZ9') {
          plan = 'studio';
        } else if (priceId?.includes('Domus') || priceId === 'price_1SJo9VR2sSXsKMlDMXxkrEAE' || priceId === 'price_1SJoKdR2sSXsKMlDb1Vu6m6F') {
          plan = 'domus';
        }

        console.log('Determined plan:', plan);

        // Update subscription
        await supabaseClient.from('subscriptions').upsert({
          workspace_id: workspaceId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        // Update workspace plan
        await supabaseClient
          .from('workspaces')
          .update({ subscription_plan: plan })
          .eq('id', workspaceId);

        console.log('Subscription and workspace updated');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        console.log('Subscription updated:', { customerId, status: subscription.status });

        // Find workspace by customer ID
        const { data: existingSub } = await supabaseClient
          .from('subscriptions')
          .select('workspace_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (!existingSub) {
          console.error('No subscription found for customer:', customerId);
          break;
        }

        // Update subscription status
        await supabaseClient
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('workspace_id', existingSub.workspace_id);

        console.log('Subscription status updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('Subscription deleted:', customerId);

        // Find workspace
        const { data: existingSub } = await supabaseClient
          .from('subscriptions')
          .select('workspace_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (!existingSub) {
          console.error('No subscription found for customer:', customerId);
          break;
        }

        // Update to free plan
        await supabaseClient
          .from('workspaces')
          .update({ subscription_plan: 'atelier' })
          .eq('id', existingSub.workspace_id);

        // Update subscription status
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('workspace_id', existingSub.workspace_id);

        console.log('Downgraded to free plan');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for:', invoice.customer);
        
        // Get workspace and user info
        const { data: sub } = await supabaseClient
          .from('subscriptions')
          .select('workspace_id')
          .eq('stripe_customer_id', invoice.customer as string)
          .maybeSingle();
        
        if (sub) {
          const { data: workspace } = await supabaseClient
            .from('workspaces')
            .select('name, created_by')
            .eq('id', sub.workspace_id)
            .single();
          
          if (workspace) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('email')
              .eq('id', workspace.created_by)
              .single();
            
            if (profile) {
              // Send payment success email
              await supabaseClient.functions.invoke('send-invoice-email', {
                body: {
                  email: profile.email,
                  workspaceName: workspace.name,
                  amount: invoice.amount_paid / 100,
                  currency: invoice.currency,
                  invoiceUrl: invoice.invoice_pdf,
                  type: 'success'
                }
              });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for:', invoice.customer);
        
        // Get workspace and user info
        const { data: sub } = await supabaseClient
          .from('subscriptions')
          .select('workspace_id')
          .eq('stripe_customer_id', invoice.customer as string)
          .maybeSingle();
        
        if (sub) {
          const { data: workspace } = await supabaseClient
            .from('workspaces')
            .select('name, created_by')
            .eq('id', sub.workspace_id)
            .single();
          
          if (workspace) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('email')
              .eq('id', workspace.created_by)
              .single();
            
            if (profile) {
              // Send payment failed email
              await supabaseClient.functions.invoke('send-invoice-email', {
                body: {
                  email: profile.email,
                  workspaceName: workspace.name,
                  amount: invoice.amount_due / 100,
                  currency: invoice.currency,
                  type: 'failed'
                }
              });
            }
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error details:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed. Please contact support.' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
