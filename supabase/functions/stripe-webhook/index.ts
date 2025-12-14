import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getPlanFromProductId, getPlanFromPriceId } from "../_shared/plan-mapping.ts";

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

    console.log('📩 Webhook event received:', event.type, 'ID:', event.id);

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

        console.log('🛒 Checkout completed:', { workspaceId, subscriptionId, customerId });

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const productId = subscription.items.data[0]?.price.product as string;

        console.log('📦 Subscription details:', { priceId, productId, status: subscription.status });

        // Determine plan from Product ID (primary) or Price ID (fallback)
        let plan = getPlanFromProductId(productId);
        if (!plan) {
          plan = getPlanFromPriceId(priceId);
        }
        
        if (!plan) {
          console.error(`❌ CRITICAL: Cannot determine plan for product_id: ${productId}, price_id: ${priceId}`);
          console.error('This checkout will NOT update the workspace plan. Manual intervention required.');
          // Still update subscription record but don't update workspace plan
        } else {
          console.log('✅ Mapped to plan:', plan);
        }

        // Update subscription with onConflict to handle existing records
        const { data: subData, error: subError } = await supabaseClient.from('subscriptions').upsert({
          workspace_id: workspaceId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { 
          onConflict: 'workspace_id'
        });

        if (subError) {
          console.error('Error updating subscription:', subError);
        } else {
          console.log('✅ Subscription record updated successfully');
        }

        // Update workspace plan ONLY if we successfully mapped the product_id
        if (plan) {
          const { error: workspaceError } = await supabaseClient
            .from('workspaces')
            .update({ subscription_plan: plan })
            .eq('id', workspaceId);

          if (workspaceError) {
            console.error('Error updating workspace:', workspaceError);
          } else {
            console.log('✅ Workspace plan updated to:', plan);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const productId = subscription.items.data[0]?.price.product as string;

        console.log('🔄 Subscription updated:', { customerId, status: subscription.status, productId, priceId });

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

        // Determine plan from Product ID (primary) or Price ID (fallback)
        let plan = getPlanFromProductId(productId);
        if (!plan) {
          plan = getPlanFromPriceId(priceId);
        }
        
        // Update subscription status
        const { error: updateError } = await supabaseClient
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

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // Update workspace plan if we can map it
        if (plan) {
          await supabaseClient
            .from('workspaces')
            .update({ subscription_plan: plan })
            .eq('id', existingSub.workspace_id);
          
          console.log('✅ Workspace plan updated to:', plan);
        }

        console.log('✅ Subscription status updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('🗑️ Subscription deleted:', customerId);

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

        // IMPORTANT: NÃO alteramos o subscription_plan aqui
        // O plano continua sendo o que foi comprado originalmente
        // O acesso será bloqueado via ProtectedRoute baseado no status 'canceled'
        
        // Apenas atualizar o status da assinatura para 'canceled'
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('workspace_id', existingSub.workspace_id);

        console.log('✅ Subscription marked as canceled (workspace plan NOT changed)');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Payment succeeded for:', invoice.customer);
        
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
        console.error('❌ Payment failed for:', invoice.customer);
        
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
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed. Please contact support.' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
