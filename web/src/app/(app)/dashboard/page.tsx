'use client'

import { useEffect, useState } from 'react'
import { DashboardClient } from '@/components/dashboard-client'
import { PushSubscribe } from '@/components/push-subscribe'
import { useI18n } from '@/lib/i18n'
import { Bot, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRecommendedItems, computePreparationScore } from '@/lib/kit-knowledge'

export default function DashboardPage() {
  const { t } = useI18n()
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('inventory_items')
      .select('category, title')
      .then(({ data }) => {
        if (data) {
          const recommended = getRecommendedItems([], false, false)
          setScore(computePreparationScore(data, recommended))
        }
      })
  }, [])

  const scoreColor = score === null ? 'text-muted' : score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      <DashboardClient />

      {/* Actions rapides */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { href: '/alertes', labelKey: 'dashboard.view_alerts', icon: '⚡' },
          { href: '/advisor', labelKey: 'Sentinel AI', icon: <Bot className="w-6 h-6 text-blue-600" /> },
          { href: '/neighborhood', labelKey: 'dashboard.neighborhood', icon: <MessageSquare className="w-6 h-6 text-emerald-500" /> },
          { href: '/kit', labelKey: 'dashboard.my_kit', icon: '🎒' },
          { href: '/premium', labelKey: 'dashboard.premium', icon: '⭐' },
        ].map(({ href, labelKey, icon }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 text-center text-sm font-medium hover:bg-surface transition-colors"
          >
            <span className="text-2xl" role="img" aria-hidden>
              {icon}
            </span>
            {labelKey.includes('.') ? t(labelKey) : labelKey}
          </a>
        ))}
      </section>

      {/* Notifications push */}
      <PushSubscribe />

      {/* Score de preparation */}
      <section className="rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">{t('dashboard.preparation_score')}</h2>
          <span className={`font-mono font-bold ${scoreColor}`}>
            {score !== null ? `${score}%` : '—%'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score === null ? 'w-0 bg-surface' :
              score >= 70 ? 'bg-green-500' :
              score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: score !== null ? `${score}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-muted">
          {score !== null && score < 100
            ? t('dashboard.complete_kit')
            : score === 100
              ? t('dashboard.kit_ready')
              : t('dashboard.complete_kit')}
        </p>
      </section>
    </div>
  )
}
