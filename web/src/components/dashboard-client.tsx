'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { enrichAlertsWithDistance, computeDefcon, haversine } from '@/lib/defcon'
import type { AlertWithDistance } from '@/lib/defcon'
import type { DefconLevel } from '@/lib/supabase/types'
import { DefconBadge } from './defcon-badge'
import { useI18n, translateAlertTitle } from '@/lib/i18n'
import { timeAgo } from '@/lib/time'
import { useTestMode } from '@/lib/test-mode-context'

export function DashboardClient() {
  const [realDefconLevel, setRealDefconLevel] = useState<DefconLevel>(5)
  const [realTopAlerts, setRealTopAlerts] = useState<AlertWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null)
  const { t, locale } = useI18n()
  const { testMode, activeScenario } = useTestMode()

  useEffect(() => {
    const supabase = createClient()

    async function fetchAlerts(lat: number, lon: number) {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, title, event_type, severity, score_fiabilite, latitude, longitude, radius_km, created_at, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error || !data) {
        setLoading(false)
        return
      }

      setTotalAlerts(data.length)
      setUserPos({ lat, lon })
      const enriched = enrichAlertsWithDistance(data, lat, lon)
      const { level, topAlerts: top } = computeDefcon(enriched)
      setRealDefconLevel(level)
      setRealTopAlerts(top)
      setLoading(false)
    }

    async function init() {
      if (!navigator.geolocation) {
        setGeoError('geo.unsupported')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAlerts(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          setGeoError(err.code === 1 ? 'geo.denied' : 'geo.unavailable')
          setLoading(false)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )
    }

    init()
  }, [])

  // Recompute DEFCON with simulated alerts when test mode is active
  const { defconLevel, topAlerts, displayTotalAlerts } = useMemo(() => {
    if (!testMode || !activeScenario || !userPos) {
      return { defconLevel: realDefconLevel, topAlerts: realTopAlerts, displayTotalAlerts: totalAlerts }
    }

    // Enrich simulated alerts with distance
    const simEnriched: AlertWithDistance[] = activeScenario.alerts.map((a) => ({
      ...a,
      distance_km: haversine(userPos.lat, userPos.lon, a.latitude, a.longitude),
    }))

    // Merge with real top alerts (re-enrich all)
    const allEnriched = [...simEnriched, ...realTopAlerts]
    const { level, topAlerts: top } = computeDefcon(allEnriched)

    return {
      defconLevel: level,
      topAlerts: top,
      displayTotalAlerts: totalAlerts + activeScenario.alerts.length,
    }
  }, [testMode, activeScenario, userPos, realDefconLevel, realTopAlerts, totalAlerts])

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6 text-center space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          {t('dashboard.risk_level')}
        </p>
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-10 w-40 bg-border rounded-lg" />
          <div className="h-4 w-56 bg-border rounded" />
        </div>
        <p className="text-sm text-muted">{t('dashboard.calculating')}</p>
      </section>
    )
  }

  if (geoError) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6 text-center space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          {t('dashboard.risk_level')}
        </p>
        <DefconBadge level={5} size="lg" />
        <p className="text-sm text-defcon-3">{t(geoError)}</p>
        <p className="text-xs text-muted">
          {totalAlerts} {t('geo.world_alerts')}
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className={`rounded-xl border bg-surface p-6 text-center space-y-3 ${
        testMode ? 'border-red-500/30' : 'border-border'
      }`}>
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          {t('dashboard.risk_level')}
        </p>
        <DefconBadge level={defconLevel} size="lg" />
        <p className="text-sm text-muted">{t(`defcon.${defconLevel}`)}</p>
        <p className="text-xs text-muted">
          {displayTotalAlerts} {t('dashboard.alerts_analyzed')}
          {testMode && activeScenario && (
            <span className="text-red-500 ml-1">
              ({activeScenario.alerts.length} {locale === 'fr' ? 'simulees' : 'simulated'})
            </span>
          )}
        </p>
      </section>

      {topAlerts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold px-1">{t('dashboard.nearby_alerts')}</h2>
          <div className="space-y-2">
            {topAlerts.map((alert) => {
              const isSimulated = alert.id.startsWith('test-')
              return (
                <a
                  key={alert.id}
                  href={`/alertes#${alert.id}`}
                  className={`flex items-center gap-3 rounded-lg border p-3 hover:bg-surface transition-colors ${
                    isSimulated
                      ? 'border-red-500/30 bg-red-500/[0.03]'
                      : 'border-border bg-background'
                  }`}
                >
                  <SeverityDot severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isSimulated && <span className="text-red-500 mr-1 text-[10px] align-middle">SIM</span>}
                      {translateAlertTitle(alert.title, alert.event_type, locale)}
                    </p>
                    <p className="text-xs text-muted">
                      {t(`event.${alert.event_type}`)} — {Math.round(alert.distance_km)} km · {timeAgo(alert.created_at, locale)}
                    </p>
                  </div>
                  <span className="text-xs text-muted font-mono">
                    {alert.score_fiabilite}%
                  </span>
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function SeverityDot({ severity }: { severity: number }) {
  const colors: Record<number, string> = {
    1: 'bg-defcon-5', 2: 'bg-defcon-4', 3: 'bg-defcon-3', 4: 'bg-defcon-2', 5: 'bg-defcon-1',
  }
  return (
    <span className={`flex-shrink-0 h-3 w-3 rounded-full ${colors[severity] ?? 'bg-muted'}`} />
  )
}
