'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

type GeoState = 'loading' | 'active' | 'denied' | 'error'

interface GeoInfo {
  state: GeoState
  label: string | null
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'fr' } }
    )
    if (!res.ok) return null
    const data = await res.json() as { address?: Record<string, string> }
    const a = data.address
    if (!a) return null
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? null
    const country = a.country_code?.toUpperCase() ?? null
    if (city && country) return `${city}, ${country}`
    return city ?? null
  } catch {
    return null
  }
}

export function GeoStatus() {
  const [geo, setGeo] = useState<GeoInfo>({ state: 'loading', label: null })
  const { t } = useI18n()

  useEffect(() => {
    if (!navigator.geolocation) {
      void Promise.resolve().then(() => setGeo({ state: 'error', label: null }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setGeo({ state: 'active', label })
      },
      (err) => {
        setGeo({ state: err.code === 1 ? 'denied' : 'error', label: null })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  if (geo.state === 'loading') return null

  const isActive = geo.state === 'active'

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-border bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs shadow-sm">
      <span
        className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isActive ? 'bg-green-500' : 'bg-muted'
        }`}
      />
      <span className={isActive ? 'text-green-600 dark:text-green-400' : 'text-muted'}>
        {isActive ? (geo.label ?? t('geo.status.active')) : t('geo.status.denied')}
      </span>
    </div>
  )
}
