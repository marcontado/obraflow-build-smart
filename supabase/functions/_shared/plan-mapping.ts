// Mapeamento centralizado de Stripe Product/Price IDs para planos internos
// Este arquivo é a ÚNICA fonte de verdade para o mapeamento de planos
// ATUALIZADO para nova conta Stripe - Dezembro 2024

export type InternalPlan = 'atelier' | 'studio' | 'domus';

// Mapeamento explícito de todos os Product IDs do Stripe para planos internos
export const STRIPE_PRODUCT_TO_PLAN: Record<string, InternalPlan> = {
  // Atelier
  'prod_TbHT7KF5Vmj9PQ': 'atelier', // mensal
  'prod_TbHSnM4aIpyBdR': 'atelier', // anual (10% desconto)
  
  // Studio  
  'prod_TbHSShzylGhbxH': 'studio', // mensal
  'prod_TbHRLj1Vdr0Wsm': 'studio', // anual (10% desconto)
  
  // Domus
  'prod_TbHRHEWYlIyBNL': 'domus', // mensal
  'prod_TbHRTAmP6Q96ed': 'domus', // anual (10% desconto)
};

// Mapeamento explícito de todos os Price IDs do Stripe para planos internos
export const STRIPE_PRICE_TO_PLAN: Record<string, InternalPlan> = {
  // Atelier
  'price_1Se4u8PESLaxCOeJhmCOQUZs': 'atelier', // mensal
  'price_1Se4ttPESLaxCOeJFdqXi9eV': 'atelier', // anual
  
  // Studio  
  'price_1Se4tXPESLaxCOeJeHGYgphJ': 'studio', // mensal
  'price_1Se4szPESLaxCOeJV4Vx173X': 'studio', // anual
  
  // Domus
  'price_1Se4saPESLaxCOeJThrqRZR3': 'domus', // mensal
  'price_1Se4sJPESLaxCOeJBaJigynl': 'domus', // anual
};

/**
 * Retorna o plano interno baseado no Stripe Product ID
 * @param productId - O product_id do Stripe
 * @returns O plano interno ou null se não encontrado
 */
export function getPlanFromProductId(productId: string | null | undefined): InternalPlan | null {
  if (!productId) {
    console.warn('getPlanFromProductId: productId is null or undefined');
    return null;
  }
  
  const plan = STRIPE_PRODUCT_TO_PLAN[productId];
  
  if (!plan) {
    console.error(`⚠️ UNKNOWN STRIPE PRODUCT ID: ${productId} - This product ID is not mapped to any internal plan`);
    return null;
  }
  
  console.log(`✅ Mapped product ${productId} to plan: ${plan}`);
  return plan;
}

/**
 * Retorna o plano interno baseado no Stripe Price ID
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
  
  console.log(`✅ Mapped price ${priceId} to plan: ${plan}`);
  return plan;
}

/**
 * Verifica se um productId é válido (existe no mapeamento)
 */
export function isValidProductId(productId: string | null | undefined): boolean {
  if (!productId) return false;
  return productId in STRIPE_PRODUCT_TO_PLAN;
}

/**
 * Verifica se um priceId é válido (existe no mapeamento)
 */
export function isValidPriceId(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return priceId in STRIPE_PRICE_TO_PLAN;
}
