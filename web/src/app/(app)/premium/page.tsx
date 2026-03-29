'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import SolanaPayModal from '@/components/solana-pay-modal'
import { Wallet, ShieldCheck, Zap, Globe, Download, History, ChevronRight } from 'lucide-react'

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
  const [showSolana, setShowSolana] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // Load premium state from localStorage (Mock)
  useEffect(() => {
    setIsPremium(localStorage.getItem('evaq_is_premium') === 'true')
  }, [])

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

  const handleSolanaSuccess = () => {
    setIsPremium(true)
    localStorage.setItem('evaq_is_premium', 'true')
    setShowSolana(false)
  }

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

      {/* Solana & Web3 Section */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 p-6 space-y-4 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <Wallet className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400/80">Solana Pay Protocol</span>
            </div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">
              {isPremium ? 'Accès Débloqué ◎' : 'Upgrade Web3 Premium'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Payez en SOL/USDC pour un anonymat total et une activation instantanée sur la blockchain.
            </p>
          </div>
        </div>

        {isPremium ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">SENTINEL AI Pro</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-500" />
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">Cartes Offline</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
               {[
                 { label: 'SENTINEL PRO', icon: Zap, color: 'text-yellow-500' },
                 { label: 'GLOBAL MAPS', icon: Globe, color: 'text-blue-500' },
                 { label: 'OFFLINE MODE', icon: Download, color: 'text-emerald-500' },
               ].map((feat, i) => (
                 <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                   <feat.icon className={`w-3 h-3 ${feat.color}`} />
                   <span className="text-[9px] font-black text-white/70 uppercase tracking-tighter">{feat.label}</span>
                 </div>
               ))}
            </div>
            
            <button
              onClick={() => setShowSolana(true)}
              className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-3 active:scale-95"
            >
              <div className="text-lg">◎</div> PAYER 0.25 SOL <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-40">
            <History className="w-3 h-3 text-slate-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Powered by Solana Decentralized Finance</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
        </div>
      </div>

      {showSolana && (
        <SolanaPayModal 
          amountSol="0.25" 
          label="EVAQ Lifetime Alpha Pass"
          onClose={() => setShowSolana(false)}
          onSuccess={handleSolanaSuccess}
        />
      )}

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
