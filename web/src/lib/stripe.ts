import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY env var')
    _stripe = new Stripe(key)
  }
  return _stripe
}

// ─── Produits et prix ─────────────────────────────────────

export const PRICE_IDS = {
  pack_alert: process.env.STRIPE_PRICE_PACK_ALERT ?? '',
  pack_evacuation: process.env.STRIPE_PRICE_PACK_EVACUATION ?? '',
  pack_kit: process.env.STRIPE_PRICE_PACK_KIT ?? '',
  pack_preparation: process.env.STRIPE_PRICE_PACK_PREPARATION ?? '',
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',
  yearly: process.env.STRIPE_PRICE_YEARLY ?? '',
} as const

export type PackId = 'alert' | 'evacuation' | 'kit' | 'preparation'
export type PlanId = 'monthly' | 'yearly'

export function getPriceId(productId: string): string | undefined {
  return (PRICE_IDS as Record<string, string>)[productId]
}
