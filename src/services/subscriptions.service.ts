import { supabase } from "@/integrations/supabase/client";

export const subscriptionsService = {
  async createCheckout(workspaceId: string, priceId: string, skipTrial?: boolean) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { workspaceId, priceId, skipTrial: skipTrial || false },
    });

    if (error) throw error;
    return data;
  },

  async getSubscription(workspaceId: string) {
    const { data, error } = await supabase.functions.invoke('get-subscription-details', {
      body: { workspaceId },
    });

    if (error) throw error;
    return data;
  },

  async cancelSubscription(workspaceId: string) {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { workspaceId },
    });

    if (error) throw error;
    return data;
  },

  async cancelSubscriptionOnBackend(subscriptionId: string) {
    await fetch(`https://archestra-backend.onrender.com/subscriptions/${subscriptionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "canceled",
        updated_at: new Date().toISOString(),
      }),
    });
  },

  async createPortalSession(workspaceId: string) {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { workspaceId },
    });

    if (error) throw error;
    return data;
  },

  async updateSubscription(workspaceId: string, priceId: string) {
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: { workspaceId, priceId },
    });

    if (error) throw error;
    return data;
  },

  async reactivateSubscription(workspaceId: string) {
    const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
      body: { workspaceId },
    });

    if (error) throw error;
    return data;
  },

  async registerSubscriptionOnBackend({
    workspaceId,
    plan,
    stripeSubscriptionId,
    status,
  }: {
    workspaceId: string;
    plan: string;
    stripeSubscriptionId: string;
    status: string;
  }) {
    await fetch("https://archestra-backend.onrender.com/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        plan,
        stripe_subscription_id: stripeSubscriptionId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  },

  async updateSubscriptionOnBackend({
    subscriptionId,
    plan,
    status,
  }: {
    subscriptionId: string;
    plan?: string;
    status: string;
  }) {
    await fetch(`https://archestra-backend.onrender.com/subscriptions/${subscriptionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        status,
        updated_at: new Date().toISOString(),
      }),
    });
  },
};
