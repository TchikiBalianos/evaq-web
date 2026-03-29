'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useI18n, translateAlertTitle } from '@/lib/i18n'
import { ArrowLeft, MapPin, Radar, Info, Shield, Users, Lightbulb, Share2 } from 'lucide-react'
import { timeAgo } from '@/lib/time'
import { getGuideForEvent } from '@/lib/threat-guides'
import dynamic from 'next/dynamic'

const AlertMap = dynamic(
  () => import('@/components/alert-map').then((m) => m.AlertMap),
  { ssr: false, loading: () => <div className="w-full h-48 rounded-xl bg-surface animate-pulse" /> }
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
  description: string | null
  source: string
}

export default function AlertDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setAlert(data as Alert)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-8 w-8 bg-surface rounded-full" />
      <div className="h-6 w-3/4 bg-surface rounded" />
      <div className="h-48 w-full bg-surface rounded-xl" />
    </div>
  )

  if (!alert) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-muted">Alerte introuvable</p>
      <button onClick={() => router.back()} className="text-blue-500 font-medium text-sm">Retour</button>
    </div>
  )

  const isSimulated = alert.id.startsWith('test-')
  const guide = getGuideForEvent(alert.event_type)
  const recommendations = guide ? (locale === 'fr' ? guide.actions_fr : guide.actions_en) : []

  return (
    <div className="min-h-full bg-background pb-20">
      {/* Header / Nav */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-semibold truncate max-w-[200px]">
          {t(`event.${alert.event_type}`)}
        </h1>
        <button className="p-2 -mr-2 hover:bg-surface rounded-full transition-colors">
          <Share2 size={18} className="text-muted" />
        </button>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            alert.severity >= 4 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full ${alert.severity >= 4 ? 'bg-red-500' : 'bg-orange-500'}`} />
            {alert.severity}/5 — {t(`severity.${alert.severity}`)}
          </div>
          {isSimulated && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-tighter">SIM</span>
          )}
          <span className="ml-auto text-xs text-muted tabular-nums">
            {timeAgo(alert.created_at, locale)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-outfit leading-tight">
          {translateAlertTitle(alert.title, alert.event_type, locale)}
        </h2>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted p-2 rounded-lg bg-surface border border-border">
            <MapPin size={14} />
            <span>{alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted p-2 rounded-lg bg-surface border border-border">
            <Radar size={14} />
            <span>Rayon: {alert.radius_km} km</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-surface border border-border text-sm leading-relaxed text-muted-foreground">
          {alert.description || t('alerts.none')}
        </div>

        {/* Recommendations / Guide */}
        {recommendations.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden">
            <div className="p-3 bg-blue-500/10 border-b border-blue-500/10 flex items-center gap-2">
              <Lightbulb size={16} className="text-blue-500" />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{t('alerts.guide_title')}</span>
            </div>
            <div className="p-4 space-y-3">
              {recommendations.map((action, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-blue-500">
                    {i + 1}
                  </div>
                  <p className="text-xs leading-normal">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Map */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold px-1">
            <Shield size={16} />
            <span>Zone d'impact</span>
          </div>
          <AlertMap 
            lat={alert.latitude}
            lon={alert.longitude}
            radius_km={alert.radius_km}
            severity={alert.severity}
          />
        </div>

        {/* Evacuation button CTA */}
        <button 
          onClick={() => router.push('/plan-fuite')}
          className="w-full flex items-center justify-center gap-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Users size={18} />
          {t('alerts.see_plan')}
        </button>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest pb-4">
          Source: {alert.source} • Fiabilité: {alert.score_fiabilite}%
        </p>
      </div>
    </div>
  )
}
