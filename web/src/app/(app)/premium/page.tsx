'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'

interface PricingCard {
  id: string
  name_key: string
  price: string
  period_key?: string
  features_keys: string[]
  highlight?: boolean
  badge_key?: string
}

const PACKS: PricingCard[] = [
  {
    id: 'pack_alert',
    name_key: 'premium.pack_alert',
    price: '1,99 €',
    features_keys: ['premium.feat_unlimited_alerts', 'premium.feat_expert_mode'],
  },
  {
    id: 'pack_evacuation',
    name_key: 'premium.pack_evacuation',
    price: '2,99 €',
    features_keys: ['premium.feat_unlimited_routes', 'premium.feat_smart_evac'],
  },
  {
    id: 'pack_kit',
    name_key: 'premium.pack_kit',
    price: '2,99 €',
    features_keys: ['premium.feat_unlimited_items', 'premium.feat_expiry_alerts'],
  },
  {
    id: 'pack_preparation',
    name_key: 'premium.pack_preparation',
    price: '4,99 €',
    features_keys: ['premium.feat_full_score', 'premium.feat_personalized_reco'],
  },
]

const SUBSCRIPTIONS: PricingCard[] = [
  {
    id: 'monthly',
    name_key: 'premium.monthly',
    price: '4,99 €',
    period_key: 'premium.per_month',
    features_keys: [
      'premium.feat_everything',
      'premium.feat_offline_tiles',
      'premium.feat_priority_notif',
      'premium.feat_no_ads',
    ],
    highlight: true,
  },
  {
    id: 'yearly',
    name_key: 'premium.yearly',
    price: '34,99 €',
    period_key: 'premium.per_year',
    badge_key: 'premium.save_42',
    features_keys: [
      'premium.feat_everything',
      'premium.feat_offline_tiles',
      'premium.feat_priority_notif',
      'premium.feat_no_ads',
    ],
  },
]

export default function PremiumPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = useCallback(async (productId: string) => {
    setLoading(productId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(null)
    }
  }, [])

  const handlePortal = useCallback(async () => {
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {}
  }, [])

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-semibold text-lg">{t('premium.title')}</h1>
        <p className="text-xs text-muted mt-1">{t('premium.subtitle')}</p>
      </div>

      {/* Subscriptions */}
      <div>
        <h2 className="font-semibold text-sm mb-3">{t('premium.subscriptions')}</h2>
        <div className="space-y-3">
          {SUBSCRIPTIONS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 space-y-3 ${
                plan.highlight
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{t(plan.name_key)}</h3>
                  {plan.badge_key && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-medium">
                      {t(plan.badge_key)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{plan.price}</span>
                  {plan.period_key && (
                    <span className="text-xs text-muted ml-1">{t(plan.period_key)}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-1">
                {plan.features_keys.map((key) => (
                  <li key={key} className="text-xs flex items-center gap-1.5">
                    <span className="text-green-500">✓</span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full h-10 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-foreground text-background hover:opacity-90'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? t('auth.loading') : t('premium.subscribe')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* One-shot packs */}
      <div>
        <h2 className="font-semibold text-sm mb-3">{t('premium.packs')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {PACKS.map((pack) => (
            <div key={pack.id} className="rounded-xl border border-border p-3 space-y-2">
              <h3 className="text-xs font-semibold">{t(pack.name_key)}</h3>
              <ul className="space-y-0.5">
                {pack.features_keys.map((key) => (
                  <li key={key} className="text-[10px] text-muted flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(pack.id)}
                disabled={loading === pack.id}
                className="w-full h-8 rounded-lg border border-border text-xs font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                {loading === pack.id ? '...' : pack.price}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manage subscription */}
      <button
        onClick={handlePortal}
        className="w-full text-xs text-muted hover:text-foreground text-center py-2"
      >
        {t('premium.manage')}
      </button>
    </div>
  )
}
