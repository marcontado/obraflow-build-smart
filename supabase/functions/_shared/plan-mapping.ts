// Mapeamento centralizado de Stripe Price IDs para planos internos
// Este arquivo é a ÚNICA fonte de verdade para o mapeamento de planos

export type InternalPlan = 'atelier' | 'studio' | 'domus';

// Mapeamento explícito de todos os price IDs do Stripe para planos internos
export const STRIPE_PRICE_TO_PLAN: Record<string, InternalPlan> = {
  // Atelier
  'price_1SYeZ4R2sSXsKMlDyDN7wd9Y': 'atelier', // mensal
  'price_1SYf24R2sSXsKMlDcmpmY1Cr': 'atelier', // anual
  
  // Studio  
  'price_1SYf44R2sSXsKMlDglRTiK4z': 'studio', // mensal
  'price_1SYf4jR2sSXsKMlDvilJvlF3': 'studio', // anual
  
  // Domus
  'price_1SYf6AR2sSXsKMlDd0MIxnK1': 'domus', // mensal
  'price_1SYf6XR2sSXsKMlDuvSJopzK': 'domus', // anual
};

/**
 * Retorna o plano interno baseado no Stripe price_id
 * @param priceId - O price_id do Stripe
 * @returns O plano interno ou null se não encontrado
 */
export function getPlanFromPriceId(priceId: string | null | undefined): InternalPlan | null {
  if (!priceId) {
    console.warn('getPlanFromPriceId: priceId is null or undefined');
    return null;
  }
  
  const plan = STRIPE_PRICE_TO_PLAN[priceId];
  
  if (!plan) {
    console.error(`⚠️ UNKNOWN STRIPE PRICE ID: ${priceId} - This price ID is not mapped to any internal plan`);
    return null;
  }
  
  return plan;
}

/**
 * Verifica se um priceId é válido (existe no mapeamento)
 */
export function isValidPriceId(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return priceId in STRIPE_PRICE_TO_PLAN;
}
