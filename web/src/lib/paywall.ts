/**
 * Système de paywall — vérification des limites par tier.
 *
 * Free:    3 alertes visibles, 1 calcul de route/jour, 15 items kit
 * Pack:    Fonctionnalité débloquée selon le pack acheté
 * Premium: Tout débloqué
 */

import type { SubscriptionTier, ActivePack } from './supabase/types'

export interface UserTier {
  subscription_tier: SubscriptionTier
  active_packs: ActivePack[]
}

export const FREE_LIMITS = {
  visible_alerts: 3,
  routes_per_day: 1,
  kit_items: 15,
  saved_plans: 1,
} as const

export function isPremium(user: UserTier): boolean {
  return user.subscription_tier === 'monthly' || user.subscription_tier === 'yearly'
}

export function hasPack(user: UserTier, packId: string): boolean {
  return user.active_packs.some((p) => p.pack_id === packId)
}

export function canViewAllAlerts(user: UserTier): boolean {
  return isPremium(user) || hasPack(user, 'alert')
}

export function canCalculateRoute(user: UserTier): boolean {
  return isPremium(user) || hasPack(user, 'evacuation')
}

export function canUseFullKit(user: UserTier): boolean {
  return isPremium(user) || hasPack(user, 'kit')
}

export function getKitLimit(user: UserTier): number {
  return canUseFullKit(user) ? Infinity : FREE_LIMITS.kit_items
}

export function getAlertLimit(user: UserTier): number {
  return canViewAllAlerts(user) ? Infinity : FREE_LIMITS.visible_alerts
}
