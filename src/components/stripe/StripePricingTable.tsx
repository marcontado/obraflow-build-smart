import { useEffect, useRef } from "react";
import { STRIPE_PRICING_TABLE_IDS, type SubscriptionPlan } from "@/constants/plans";

interface StripePricingTableProps {
  plan: SubscriptionPlan;
  publishableKey: string;
  className?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
          'client-reference-id'?: string;
          'customer-email'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export function StripePricingTable({ plan, publishableKey, className }: StripePricingTableProps) {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load Stripe Pricing Table script only once
    if (!scriptLoadedRef.current && !document.querySelector('script[src*="pricing-table.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }
  }, []);

  const pricingTableId = STRIPE_PRICING_TABLE_IDS[plan];

  if (!pricingTableId) {
    console.error(`No pricing table ID found for plan: ${plan}`);
    return null;
  }

  return (
    <div className={className}>
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
      />
    </div>
  );
}
