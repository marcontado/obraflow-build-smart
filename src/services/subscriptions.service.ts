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
};
