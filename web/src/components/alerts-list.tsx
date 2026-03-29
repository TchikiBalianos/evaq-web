'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { haversine } from '@/lib/defcon'
import { useI18n, translateAlertTitle } from '@/lib/i18n'
import { getGuideForEvent } from '@/lib/threat-guides'
import { timeAgo } from '@/lib/time'
import { useTestMode } from '@/lib/test-mode-context'

const AlertMap = dynamic(
  () => import('./alert-map').then((m) => m.AlertMap),
  { ssr: false, loading: () => <div className="mt-2 h-[180px] rounded-lg border border-border bg-surface animate-pulse" /> }
)

interface Alert {
  id: string
  title: string
  event_type: string
  severity: number
  score_fiabilite: number
  latitude: number
  longitude: number
  radius_km: number
  created_at: string
  is_active: boolean
  description: string | null
  source: string
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  EQ: '🌍', FL: '🌊', TC: '🌀', VO: '🌋', DR: '☀️', WF: '🔥',
  CONFLICT: '⚔️', HEALTH: '🏥', NUCLEAR: '☢️', CHEMICAL: '🧪',
  SHORTAGE: '📦', CYBER: '💻', UNREST: '🚧',
}

type SortKey = 'date' | 'severity' | 'distance'


export function AlertsList() {
  const [realAlerts, setRealAlerts] = useState<(Alert & { distance_km?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'sage' | 'expert'>('expert')
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null)
  const router = useRouter()
  const { t, locale } = useI18n()
  const { testMode, activeScenario } = useTestMode()

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, title, event_type, severity, score_fiabilite, latitude, longitude, radius_km, created_at, is_active, description, source')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error || !data) {
        setLoading(false)
        return
      }

      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords
          setUserPos({ lat, lon })
          setRealAlerts(
            data.map((a) => ({
              ...a,
              distance_km: haversine(lat, lon, a.latitude, a.longitude),
            }))
          )
          setLoading(false)
        },
        () => {
          setRealAlerts(data)
          setLoading(false)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )
    }

    load()
  }, [])

  // Merge real alerts with test alerts when test mode is active
  const alerts = testMode && activeScenario
    ? [
        ...activeScenario.alerts.map((a) => ({
          ...a,
          distance_km: userPos ? haversine(userPos.lat, userPos.lon, a.latitude, a.longitude) : undefined,
        })),
        ...realAlerts,
      ]
    : realAlerts

  const filtered = alerts.filter((a) =>
    mode === 'sage' ? a.score_fiabilite >= 80 : true
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'severity') return b.severity - a.severity
    if (sortBy === 'distance' && a.distance_km != null && b.distance_km != null)
      return a.distance_km - b.distance_km
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">{t('alerts.title')}</h1>
        <button
          onClick={() => setMode(mode === 'sage' ? 'expert' : 'sage')}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            mode === 'sage'
              ? 'bg-defcon-5-bg text-defcon-5'
              : 'bg-defcon-3-bg text-defcon-3'
          }`}
        >
          {mode === 'sage' ? t('alerts.mode.sage') : t('alerts.mode.expert')}
        </button>
      </div>

      {mode === 'expert' && (
        <p className="text-xs text-muted">
          {t('alerts.expert_info')}{' '}
          <button onClick={() => setMode('sage')} className="underline">
            {t('alerts.switch_sage')}
          </button>
        </p>
      )}

      {mode === 'sage' && (
        <p className="text-xs text-muted">
          {t('alerts.sage_info')}{' '}
          <button onClick={() => setMode('expert')} className="underline">
            {t('alerts.switch_expert')}
          </button>
        </p>
      )}

      {/* Tri */}
      <div className="flex gap-2">
        {(['date', 'severity', 'distance'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            disabled={key === 'distance' && !userPos}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              sortBy === key
                ? 'bg-foreground text-background'
                : 'bg-surface text-muted hover:text-foreground'
            } ${key === 'distance' && !userPos ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {t(`alerts.sort.${key}`)}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border p-4 space-y-2">
              <div className="h-4 w-3/4 bg-border rounded" />
              <div className="h-3 w-1/2 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <p className="font-medium text-sm">{t('alerts.none')}</p>
          <p className="text-xs text-muted">
            {mode === 'sage' ? t('alerts.none_sage') : t('alerts.none_expert')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            {sorted.length} {sorted.length > 1 ? t('alerts.count_plural') : t('alerts.count')}
            {testMode && activeScenario && (
              <span className="text-red-500 ml-1">
                ({activeScenario.alerts.length} {locale === 'fr' ? 'simulees' : 'simulated'})
              </span>
            )}
          </p>
          {sorted.map((alert) => {
            const isExpanded = expandedId === alert.id
            const isSimulated = alert.id.startsWith('test-')
            return (
              <div
                key={alert.id}
                id={alert.id}
                className={`rounded-lg border overflow-hidden transition-colors ${
                  isSimulated
                    ? 'border-red-500/30 bg-red-500/[0.03]'
                    : 'border-border bg-background'
                }`}
              >
                <button
                  onClick={() => router.push(`/alertes/${alert.id}`)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface transition-colors"
                >
                  <span className="text-xl flex-shrink-0">
                    {EVENT_TYPE_ICONS[alert.event_type] ?? '⚠️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isSimulated && <span className="text-red-500 mr-1 text-[10px] align-middle">SIM</span>}
                      {translateAlertTitle(alert.title, alert.event_type, locale)}
                    </p>
                    <p className="text-xs text-muted">
                      {t(`event.${alert.event_type}`)}
                      {alert.distance_km != null && ` — ${Math.round(alert.distance_km)} km`}
                      {' · '}
                      <span className="text-muted/70">{timeAgo(alert.created_at, locale)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <SeverityPill severity={alert.severity} />
                    <span className="text-[10px] text-muted font-mono">
                      {alert.score_fiabilite}%
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border">
                    {alert.description && (
                      <p className="text-xs text-muted leading-relaxed pt-2">
                        {alert.description}
                      </p>
                    )}
                    <AlertMap
                      lat={alert.latitude}
                      lon={alert.longitude}
                      radius_km={alert.radius_km}
                      severity={alert.severity}
                    />
                    {/* Fiche conseil */}
                    {(() => {
                      const guide = getGuideForEvent(alert.event_type)
                      if (!guide) return null
                      const actions = locale === 'fr' ? guide.actions_fr : guide.actions_en
                      return (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1.5">
                          <p className="text-xs font-semibold">{t('alerts.guide_title')}</p>
                          <ul className="space-y-1">
                            {actions.map((a, i) => (
                              <li key={i} className="text-[11px] text-foreground/80 flex gap-1.5">
                                <span className="text-blue-500 flex-shrink-0">•</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[9px] text-muted">{guide.source}</p>
                        </div>
                      )
                    })()}

                    <div className="flex flex-wrap gap-2 text-[10px] text-muted">
                      <span>{t('alerts.source')} : {alert.source}</span>
                      <span>{t('alerts.radius')} : {alert.radius_km} km</span>
                      <span>{t('alerts.coords')} : {alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)}</span>
                      <span>
                        {new Date(alert.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SeverityPill({ severity }: { severity: number }) {
  const { t } = useI18n()
  const config: Record<number, string> = {
    1: 'bg-surface text-muted',
    2: 'bg-defcon-5-bg text-defcon-5',
    3: 'bg-defcon-3-bg text-defcon-3',
    4: 'bg-defcon-2-bg text-defcon-2',
    5: 'bg-defcon-1-bg text-defcon-1',
  }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${config[severity] ?? config[1]}`}>
      {t(`severity.${severity}`)}
    </span>
  )
}
