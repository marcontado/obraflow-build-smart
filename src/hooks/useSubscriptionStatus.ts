import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Subscription {
  id: string;
  workspace_id: string;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

export function useSubscriptionStatus() {
  const { currentWorkspace } = useWorkspace();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("workspace_id", currentWorkspace.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
          setSubscription(null);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching subscription:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentWorkspace?.id]);

  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";
  const isTrialing = subscription?.status === "trialing";

  return {
    subscription,
    loading,
    hasActiveSubscription,
    isTrialing,
  };
}
