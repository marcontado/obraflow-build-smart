import { supabase } from "@/integrations/supabase/client";

export const subscriptionsService = {
  async createCheckout(workspaceId: string, priceId: string) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { workspaceId, priceId },
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
};
