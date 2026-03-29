import { describe, it, expect } from 'vitest'
import {
  isPremium,
  hasPack,
  canViewAllAlerts,
  canCalculateRoute,
  canUseFullKit,
  getKitLimit,
  getAlertLimit,
  FREE_LIMITS,
} from '../paywall'

const freeUser = { subscription_tier: 'free' as const, active_packs: [] }
const monthlyUser = { subscription_tier: 'monthly' as const, active_packs: [] }
const yearlyUser = { subscription_tier: 'yearly' as const, active_packs: [] }
const alertPackUser = {
  subscription_tier: 'free' as const,
  active_packs: [{ pack_id: 'alert' as const, purchased_at: '2026-01-01', expires_at: null }],
}
const kitPackUser = {
  subscription_tier: 'free' as const,
  active_packs: [{ pack_id: 'kit' as const, purchased_at: '2026-01-01', expires_at: null }],
}

describe('paywall — isPremium', () => {
  it('free → false', () => expect(isPremium(freeUser)).toBe(false))
  it('monthly → true', () => expect(isPremium(monthlyUser)).toBe(true))
  it('yearly → true', () => expect(isPremium(yearlyUser)).toBe(true))
})

describe('paywall — hasPack', () => {
  it('free sans pack → false', () => expect(hasPack(freeUser, 'alert')).toBe(false))
  it('avec pack alert → true', () => expect(hasPack(alertPackUser, 'alert')).toBe(true))
  it('avec pack alert mais check kit → false', () => expect(hasPack(alertPackUser, 'kit')).toBe(false))
})

describe('paywall — feature access', () => {
  it('free user: alertes limitées', () => {
    expect(canViewAllAlerts(freeUser)).toBe(false)
    expect(getAlertLimit(freeUser)).toBe(FREE_LIMITS.visible_alerts)
  })

  it('alert pack: alertes illimitées', () => {
    expect(canViewAllAlerts(alertPackUser)).toBe(true)
    expect(getAlertLimit(alertPackUser)).toBe(Infinity)
  })

  it('premium: tout illimité', () => {
    expect(canViewAllAlerts(monthlyUser)).toBe(true)
    expect(canCalculateRoute(monthlyUser)).toBe(true)
    expect(canUseFullKit(monthlyUser)).toBe(true)
    expect(getKitLimit(monthlyUser)).toBe(Infinity)
  })

  it('free user: kit limité à 15', () => {
    expect(canUseFullKit(freeUser)).toBe(false)
    expect(getKitLimit(freeUser)).toBe(15)
  })

  it('kit pack: kit illimité', () => {
    expect(canUseFullKit(kitPackUser)).toBe(true)
    expect(getKitLimit(kitPackUser)).toBe(Infinity)
  })
})
