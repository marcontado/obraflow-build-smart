import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Product IDs da nova conta Stripe (Dezembro 2024)
const PRODUCT_IDS = {
  atelier: {
    monthly: "prod_TbHT7KF5Vmj9PQ",
    yearly: "prod_TbHSnM4aIpyBdR",
  },
  studio: {
    monthly: "prod_TbHSShzylGhbxH",
    yearly: "prod_TbHRLj1Vdr0Wsm",
  },
  domus: {
    monthly: "prod_TbHRHEWYlIyBNL",
    yearly: "prod_TbHRTAmP6Q96ed",
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('📋 Fetching price IDs from Stripe...');

    const priceMapping: Record<string, { monthly: string; yearly: string }> = {
      atelier: { monthly: '', yearly: '' },
      studio: { monthly: '', yearly: '' },
      domus: { monthly: '', yearly: '' },
    };

    // Fetch prices for each product
    for (const [plan, products] of Object.entries(PRODUCT_IDS)) {
      // Monthly
      const monthlyPrices = await stripe.prices.list({
        product: products.monthly,
        active: true,
        limit: 1,
      });
      if (monthlyPrices.data.length > 0) {
        priceMapping[plan].monthly = monthlyPrices.data[0].id;
        console.log(`✅ ${plan} monthly: ${monthlyPrices.data[0].id}`);
      }

      // Yearly
      const yearlyPrices = await stripe.prices.list({
        product: products.yearly,
        active: true,
        limit: 1,
      });
      if (yearlyPrices.data.length > 0) {
        priceMapping[plan].yearly = yearlyPrices.data[0].id;
        console.log(`✅ ${plan} yearly: ${yearlyPrices.data[0].id}`);
      }
    }

    console.log('📦 Price mapping complete:', priceMapping);

    return new Response(
      JSON.stringify({ prices: priceMapping }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Error fetching prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
