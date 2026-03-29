'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { createClient } from '@/lib/supabase/client'
import { circleGeoJSON } from '@/lib/geo'
import { useI18n, translateAlertTitle } from '@/lib/i18n'
import { getEvacuationAdvice, destinationPoint } from '@/lib/evacuation-logic'
import { WindData, EvacuationAdvice } from '@/lib/evacuation-logic'
import { Download, ShieldCheck } from 'lucide-react'
import { getSavedPlans, savePlan, deletePlan } from '@/lib/saved-plans'
import type { SavedPlan } from '@/lib/saved-plans'
import { fetchRouteStops, getStopIcon } from '@/lib/route-stops'
import type { RouteStop } from '@/lib/route-stops'
import { fetchACLEDConflicts, conflictsToGeoJSON } from '@/lib/acled'
import type { ACLEDConflict } from '@/lib/acled'
import { useTestMode } from '@/lib/test-mode-context'

function haversineQuick(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const SEVERITY_FILL_COLOR: maplibregl.ExpressionSpecification = [
  'match', ['get', 'severity'],
  1, '#71717a', 2, '#eab308', 3, '#f97316', 4, '#ef4444', 5, '#dc2626',
  '#f97316',
]

const SEVERITY_MARKER_COLORS: Record<number, string> = {
  1: '#71717a', 2: '#eab308', 3: '#f97316', 4: '#ef4444', 5: '#dc2626',
}

interface Alert {
  id: string
  title: string
  event_type: string
  severity: number
  latitude: number
  longitude: number
  radius_km: number
}

interface RouteInfo {
  index: number
  distance_km: number
  duration_min: number
  geometry: GeoJSON.LineString
}

type RoutingState = 'idle' | 'selecting' | 'calculating' | 'showing'

export function EvacuationMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const destMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loaded, setLoaded] = useState(false)
  const [routingState, setRoutingState] = useState<RoutingState>('idle')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [wind, setWind] = useState<WindData | null>(null)
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [stops, setStops] = useState<RouteStop[]>([])
  const [stopsLoading, setStopsLoading] = useState(false)
  const [showStops, setShowStops] = useState(false)
  const stopMarkersRef = useRef<maplibregl.Marker[]>([])
  const [conflicts, setConflicts] = useState<ACLEDConflict[]>([])
  const [showConflicts, setShowConflicts] = useState(true)
  const conflictMarkersRef = useRef<maplibregl.Marker[]>([])
  const { t, locale } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isOfflineReady, setIsOfflineReady] = useState(false)
  const { testMode, activeScenario } = useTestMode()

  // Fetch alerts
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('alerts')
        .select('id, title, event_type, severity, latitude, longitude, radius_km')
        .eq('is_active', true)
        .limit(200)
      if (data) setAlerts(data as Alert[])
      setLoaded(true)

      // Load ACLED conflicts
      const acled = await fetchACLEDConflicts()
      setConflicts(acled)
    }
    load()
  }, [])

  // Merge simulated alerts with real alerts for map display
  const displayAlerts = useMemo<Alert[]>(() => {
    if (!testMode || !activeScenario) return alerts
    const simAlerts: Alert[] = activeScenario.alerts.map((a) => ({
      id: a.id,
      title: a.title,
      event_type: a.event_type,
      severity: a.severity,
      latitude: a.latitude,
      longitude: a.longitude,
      radius_km: a.radius_km,
    }))
    return [...simAlerts, ...alerts]
  }, [alerts, testMode, activeScenario])

  // Load saved plans
  useEffect(() => { void Promise.resolve().then(() => setSavedPlans(getSavedPlans())) }, [])

  // Track user position
  useEffect(() => {
    if (!navigator.geolocation) return
    const wid = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.longitude, pos.coords.latitude]),
      () => {},
      { enableHighAccuracy: false }
    )
    return () => navigator.geolocation.clearWatch(wid)
  }, [])

  // Fetch wind data when user position is known
  const userPosKey = userPos ? `${userPos[0].toFixed(1)},${userPos[1].toFixed(1)}` : null
  useEffect(() => {
    if (!userPos) return
    const [lon, lat] = userPos
    async function fetchWind() {
      try {
        const r = await fetch(`/api/wind?lat=${lat}&lon=${lon}`)
        if (r.ok) {
          const data = await r.json()
          if (data) setWind(data)
        }
      } catch { /* ignore */ }
    }
    fetchWind()
  }, [userPosKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute evacuation advice when alerts + position are available (derived state)
  const evacAdvice = useMemo<EvacuationAdvice | null>(() => {
    if (!userPos || displayAlerts.length === 0) return null
    const userLat = userPos[1]
    const userLon = userPos[0]
    let closestThreat: Alert | null = null
    let closestRatio = Infinity
    for (const a of displayAlerts) {
      const dist = haversineQuick(userLat, userLon, a.latitude, a.longitude)
      const ratio = dist / a.radius_km
      if (ratio < 3 && ratio < closestRatio) {
        closestRatio = ratio
        closestThreat = a
      }
    }
    if (!closestThreat) return null
    return getEvacuationAdvice(userLat, userLon, closestThreat, wind)
  }, [userPos, displayAlerts, wind])

  // Init map (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [2.35, 48.86],
      zoom: 5,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        trackUserLocation: true,
      }),
      'top-right'
    )

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Add threat zone overlays when alerts load
  useEffect(() => {
    const map = mapRef.current
    if (!map || displayAlerts.length === 0) return

    const addLayers = () => {
      // Remove old layers/sources if they exist (for re-render with test mode)
      if (map.getLayer('threat-fill')) map.removeLayer('threat-fill')
      if (map.getLayer('threat-border')) map.removeLayer('threat-border')
      if (map.getSource('threat-zones')) map.removeSource('threat-zones')
      // Remove old markers
      for (const m of markersRef.current) m.remove()
      markersRef.current = []

      const features: GeoJSON.Feature[] = displayAlerts.map((a) => ({
        ...circleGeoJSON(a.longitude, a.latitude, a.radius_km),
        properties: { severity: a.severity },
      }))

      map.addSource('threat-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      })

      map.addLayer({
        id: 'threat-fill',
        type: 'fill',
        source: 'threat-zones',
        paint: { 'fill-color': SEVERITY_FILL_COLOR, 'fill-opacity': 0.1 },
      })

      map.addLayer({
        id: 'threat-border',
        type: 'line',
        source: 'threat-zones',
        paint: { 'line-color': SEVERITY_FILL_COLOR, 'line-width': 1.5, 'line-opacity': 0.35 },
      })

      // Epicenter markers with popups
      for (const a of displayAlerts) {
        const color = SEVERITY_MARKER_COLORS[a.severity] ?? '#f97316'
        const translatedTitle = translateAlertTitle(a.title, a.event_type, locale)
        const typeLabel = locale === 'fr'
          ? ({ EQ: 'Séisme', FL: 'Inondation', TC: 'Cyclone', VO: 'Volcan', DR: 'Sécheresse', WF: 'Feu', CONFLICT: 'Conflit', HEALTH: 'Sanitaire' }[a.event_type] ?? a.event_type)
          : a.event_type

        const isSimulated = a.id.startsWith('test-')
        const simBadge = isSimulated ? `<span style="display:inline-block;font-size:9px;padding:1px 4px;border-radius:3px;background:#ef444433;color:#ef4444;font-weight:700;margin-right:4px;">SIM</span>` : ''

        const popup = new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: '260px' })
          .setHTML(
            `<div style="font-size:13px;line-height:1.5;padding:2px 0;color:#1a1a1a;">` +
            `<b style="display:block;margin-bottom:4px;color:#111;">${simBadge}${translatedTitle}</b>` +
            `<span style="display:inline-block;font-size:11px;padding:1px 6px;border-radius:4px;background:${color}22;color:${color};font-weight:600;margin-bottom:4px;">${typeLabel}</span>` +
            `<br/><span style="color:#666;font-size:11px;">⚡ Sévérité ${a.severity}/5 · 📏 ${a.radius_km} km</span>` +
            `</div>`
          )

        // Créer un élément marker custom plus grand et cliquable
        const el = document.createElement('div')
        el.style.width = isSimulated ? '24px' : '20px'
        el.style.height = isSimulated ? '24px' : '20px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = color
        el.style.border = isSimulated ? '3px solid #ef4444' : '2px solid white'
        el.style.boxShadow = isSimulated ? '0 0 8px rgba(239,68,68,0.5)' : '0 1px 4px rgba(0,0,0,0.3)'
        el.style.cursor = 'pointer'
        if (isSimulated) el.style.animation = 'pulse 2s ease-in-out infinite'

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([a.longitude, a.latitude])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      }
    }

    if (map.isStyleLoaded()) addLayers()
    else map.on('load', addLayers)
  }, [displayAlerts, locale])

  // Add ACLED layers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || conflicts.length === 0) return

    const addAcledLayers = () => {
      if (map.getLayer('acled-heatmap')) map.removeLayer('acled-heatmap')
      if (map.getLayer('acled-point')) map.removeLayer('acled-point')
      if (map.getSource('acled-conflicts')) map.removeSource('acled-conflicts')
      
      for (const m of conflictMarkersRef.current) m.remove()
      conflictMarkersRef.current = []

      map.addSource('acled-conflicts', {
        type: 'geojson',
        data: conflictsToGeoJSON(conflicts),
      })

      // Heatmap layer for global density
      map.addLayer({
        id: 'acled-heatmap',
        type: 'heatmap',
        source: 'acled-conflicts',
        maxzoom: 12,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'fatalities'], 0, 0, 10, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 12, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(239,68,68,0)', 0.2, 'rgba(239,68,68,0.2)',
            0.4, 'rgba(239,68,68,0.4)', 0.6, 'rgba(239,68,68,0.7)',
            0.8, 'rgba(185,28,28,0.8)', 1, 'rgba(153,27,27,0.9)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 12, 20],
          'heatmap-opacity': showConflicts ? 0.6 : 0,
        },
      })

      // Points for high zoom
      map.addLayer({
        id: 'acled-point',
        type: 'circle',
        source: 'acled-conflicts',
        minzoom: 8,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3, 16, 10],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': showConflicts ? 0.8 : 0,
          'circle-stroke-opacity': showConflicts ? 0.8 : 0,
        },
      })

      // Interactive markers for details
      if (showConflicts) {
        for (const c of conflicts) {
          const el = document.createElement('div')
          el.className = 'acled-marker'
          el.style.width = '12px'
          el.style.height = '12px'
          el.style.backgroundColor = 'transparent'
          el.style.cursor = 'pointer'

          const popup = new maplibregl.Popup({ offset: 10, maxWidth: '240px' })
            .setHTML(`
              <div style="font-size:12px;padding:4px;">
                <div style="font-weight:700;margin-bottom:4px;color:#ef4444;">🚨 ${c.event_type.toUpperCase()}</div>
                <div style="font-size:11px;font-weight:600;margin-bottom:2px;">${c.location}</div>
                <div style="font-size:10px;color:#666;margin-bottom:6px;">${c.actor1} · ${c.event_date}</div>
                <div style="font-size:11px;line-height:1.4;">${c.notes}</div>
                <div style="margin-top:6px;font-weight:700;color:#111;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;">Fatalités: ${c.fatalities}</div>
              </div>
            `)

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([c.longitude, c.latitude])
            .setPopup(popup)
            .addTo(map)
          conflictMarkersRef.current.push(marker)
        }
      }
    }

    addAcledLayers()
  }, [conflicts, showConflicts])

  // Handle map clicks for destination selection
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (routingState !== 'selecting') return
      // Ignorer si le clic vient d'un marqueur (popup ouvert)
      const target = (e.originalEvent?.target as HTMLElement)
      if (target?.closest('.maplibregl-marker') || target?.closest('.maplibregl-popup')) return

      const { lng, lat } = e.lngLat
      setDestination([lng, lat])

      // Place/move destination marker
      if (destMarkerRef.current) destMarkerRef.current.remove()
      const marker = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat([lng, lat])
        .addTo(map)
      destMarkerRef.current = marker
    }

    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [routingState])

  // Update cursor style based on routing state
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const canvas = map.getCanvasContainer()
    canvas.style.cursor = routingState === 'selecting' ? 'crosshair' : ''
  }, [routingState])

  const clearRoutes = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    for (let i = 0; i < 3; i++) {
      if (map.getLayer(`route-${i}`)) map.removeLayer(`route-${i}`)
      if (map.getSource(`route-${i}`)) map.removeSource(`route-${i}`)
    }
  }, [])

  const startSelecting = useCallback(() => {
    setRoutingState('selecting')
    setRoutes([])
    setRouteError(null)
    setDestination(null)
    clearRoutes()
  }, [clearRoutes])

  const smartEvacuate = useCallback(() => {
    if (!userPos || !evacAdvice || !evacAdvice.suggested_bearing_deg) return
    const [lon, lat] = destinationPoint(
      userPos[1], userPos[0],
      evacAdvice.suggested_bearing_deg,
      evacAdvice.min_distance_km
    )
    setDestination([lon, lat])

    // Place destination marker
    const map = mapRef.current
    if (map) {
      if (destMarkerRef.current) destMarkerRef.current.remove()
      const marker = new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat([lon, lat])
        .addTo(map)
      destMarkerRef.current = marker
    }

    setRoutingState('selecting')
    setRoutes([])
    setRouteError(null)
  }, [userPos, evacAdvice])

  const clearStopMarkers = useCallback(() => {
    for (const m of stopMarkersRef.current) m.remove()
    stopMarkersRef.current = []
  }, [])

  const cancelRouting = useCallback(() => {
    setRoutingState('idle')
    setRoutes([])
    setRouteError(null)
    setDestination(null)
    setStops([])
    setShowStops(false)
    clearRoutes()
    clearStopMarkers()
    if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }
  }, [clearRoutes])

  const displayRoutes = useCallback((routeList: RouteInfo[], selected: number) => {
    const map = mapRef.current
    if (!map) return

    clearRoutes()

    // Add routes in reverse order so primary is on top
    const sorted = [...routeList].sort((a, b) => {
      if (a.index === selected) return 1
      if (b.index === selected) return -1
      return 0
    })

    for (const r of sorted) {
      const isPrimary = r.index === selected
      const sourceId = `route-${r.index}`

      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'Feature', geometry: r.geometry, properties: {} },
      })

      map.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': isPrimary ? '#3b82f6' : '#9ca3af',
          'line-width': isPrimary ? 5 : 3,
          'line-opacity': isPrimary ? 0.85 : 0.5,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })
    }

    // Fit bounds to primary route
    const primary = routeList[selected]
    if (primary) {
      const coords = primary.geometry.coordinates as [number, number][]
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      )
      map.fitBounds(bounds, { padding: 80, maxZoom: 14 })
    }
  }, [clearRoutes])

  const calculateRoute = useCallback(async () => {
    if (!userPos || !destination) return

    setRoutingState('calculating')
    setRouteError(null)

    const from = `${userPos[0]},${userPos[1]}`
    const to = `${destination[0]},${destination[1]}`

    try {
      const res = await fetch(`/api/route?from=${from}&to=${to}&profile=driving`)
      const data = await res.json()

      if (!res.ok || !data.routes) {
        setRouteError(data.error ?? t('route.error'))
        setRoutingState('selecting')
        return
      }

      setRoutes(data.routes)
      setSelectedRoute(0)
      setRoutingState('showing')
      displayRoutes(data.routes, 0)

      // Fetch POI stops along the primary route
      setStopsLoading(true)
      setStops([])
      const primaryRoute = data.routes[0]
      if (primaryRoute?.geometry) {
        fetchRouteStops(primaryRoute.geometry)
          .then((s) => {
            setStops(s)
            // Add stop markers to map
            clearStopMarkers()
            const map = mapRef.current
            if (map) {
              for (const stop of s) {
                const el = document.createElement('div')
                el.style.cssText = 'font-size:16px;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));'
                el.textContent = getStopIcon(stop.type)
                const popup = new maplibregl.Popup({ offset: 15, maxWidth: '200px' })
                  .setHTML(
                    `<div style="font-size:12px;color:#1a1a1a;line-height:1.4;">` +
                    `<b>${stop.name || t(`route.${stop.type}`)}</b>` +
                    (stop.details ? `<br/><span style="color:#666;">${stop.details}</span>` : '') +
                    `<br/><span style="color:#999;">~${stop.distance_km} km</span>` +
                    `</div>`
                  )
                const marker = new maplibregl.Marker({ element: el })
                  .setLngLat([stop.lon, stop.lat])
                  .setPopup(popup)
                  .addTo(map)
                stopMarkersRef.current.push(marker)
              }
            }
          })
          .catch(() => {})
          .finally(() => setStopsLoading(false))
      }
    } catch {
      setRouteError(t('route.error'))
      setRoutingState('selecting')
    }
  }, [userPos, destination, t, displayRoutes, clearStopMarkers])

  const selectRoute = useCallback((index: number) => {
    setSelectedRoute(index)
    displayRoutes(routes, index)
  }, [routes, displayRoutes])

  const handleSavePlan = useCallback(() => {
    if (!userPos || !destination || routes.length === 0) return
    const route = routes[selectedRoute]
    const saved = savePlan({
      from: userPos,
      to: destination,
      distance_km: route.distance_km,
      duration_min: route.duration_min,
      strategy: evacAdvice?.strategy ?? 'manual',
      threat_type: evacAdvice ? null : null,
      geometry: route.geometry,
    })
    setSavedPlans((prev) => [saved, ...prev].slice(0, 3))
  }, [userPos, destination, routes, selectedRoute, evacAdvice])

  const handleLoadPlan = useCallback((plan: SavedPlan) => {
    setShowSaved(false)
    setDestination(plan.to)

    const map = mapRef.current
    if (map) {
      if (destMarkerRef.current) destMarkerRef.current.remove()
      const marker = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat(plan.to)
        .addTo(map)
      destMarkerRef.current = marker

      clearRoutes()
      const sourceId = 'route-0'
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'Feature', geometry: plan.geometry, properties: {} },
      })
      map.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.85 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })

      const coords = plan.geometry.coordinates as [number, number][]
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      )
      map.fitBounds(bounds, { padding: 80, maxZoom: 14 })
    }

    setRoutes([{
      index: 0,
      distance_km: plan.distance_km,
      duration_min: plan.duration_min,
      geometry: plan.geometry,
    }])
    setSelectedRoute(0)
    setRoutingState('showing')
  }, [clearRoutes])

  const handleDeletePlan = useCallback((id: string) => {
    deletePlan(id)
    setSavedPlans((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
  }

  const handleDownloadArea = async () => {
    const map = mapRef.current
    if (!map || isDownloading) return

    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const center = map.getCenter()
      const zoom = Math.floor(map.getZoom())
      const levels = [zoom, zoom + 1, zoom + 2]
      const tiles: string[] = []

      // Calculate a small grid around center
      for (const z of levels) {
        if (z > 15) continue
        const x = Math.floor((center.lng + 180) / 360 * Math.pow(2, z))
        const y = Math.floor((1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
        
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            tiles.push(`https://tiles.openfreemap.org/data/v3/${z}/${x + dx}/${y + dy}.pbf`)
          }
        }
      }

      let count = 0
      for (const url of tiles) {
        try {
          await fetch(url, { mode: 'no-cors' }) // Trigger service worker cache
          count++
          setDownloadProgress(Math.round((count / tiles.length) * 100))
        } catch { /* skip failed tiles */ }
      }
      
      setIsOfflineReady(true)
      localStorage.setItem('evaq_map_offline_ready', 'true')
    } catch (e) {
      console.error("Download failed", e)
    } finally {
      setTimeout(() => setIsDownloading(false), 1000)
    }
  }

  useEffect(() => {
    setIsOfflineReady(localStorage.getItem('evaq_map_offline_ready') === 'true')
  }, [])

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />

      {/* Selecting mode banner */}
      {routingState === 'selecting' && !destination && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm px-4 py-2 text-center">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('route.tap_destination')}
            </p>
            <button
              onClick={cancelRouting}
              className="mt-1 text-xs text-muted hover:text-foreground"
            >
              {t('route.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Floating bottom panel */}
      <div className="absolute bottom-24 left-4 right-4 z-20 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto rounded-xl border border-border bg-background/90 backdrop-blur-sm shadow-lg">
          <div className="p-4 space-y-3">

            {/* State: idle or selecting without destination */}
            {(routingState === 'idle' || (routingState === 'selecting' && !destination)) && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm">{t('plan.title')}</h2>
                  <span className="text-xs text-muted">
                    {loaded
                      ? `${displayAlerts.length} ${t('plan.active_threats')}${testMode && activeScenario ? ` (${activeScenario.alerts.length} sim)` : ''}`
                      : t('dashboard.calculating')}
                  </span>
                </div>
                {/* Evacuation advice banner */}
                {evacAdvice && evacAdvice.strategy !== 'no_action' && (
                  <div className={`rounded-lg p-2.5 text-xs ${
                    evacAdvice.strategy === 'shelter_in_place'
                      ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400'
                  }`}>
                    <p className="font-medium">{t(evacAdvice.description_key)}</p>
                    {wind && (
                      <p className="mt-1 opacity-70">
                        {t('route.wind_info')}: {wind.speed_kmh} km/h — {t('route.wind_from')} {wind.direction_deg}°
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted">{t('plan.calculate_desc_short')}</p>

                {/* ACLED Conflict Toggle */}
                <button
                  onClick={() => setShowConflicts(!showConflicts)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    showConflicts 
                      ? 'bg-red-500/5 border-red-500/20 text-red-600' 
                      : 'bg-surface border-border text-muted hover:text-foreground'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${showConflicts ? 'bg-red-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Zones de conflit (ACLED)</span>
                </button>

                {/* Smart evacuate button */}
                {evacAdvice && evacAdvice.suggested_bearing_deg !== null && (
                  <button
                    onClick={smartEvacuate}
                    className="w-full h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {t('route.smart_evacuate')}
                  </button>
                )}

                <button
                  onClick={startSelecting}
                  disabled={!userPos}
                  className={`w-full h-10 rounded-lg text-sm font-medium transition-colors ${
                    userPos
                      ? evacAdvice ? 'border border-border text-foreground hover:bg-foreground/5' : 'bg-foreground text-background hover:opacity-90'
                      : 'bg-foreground text-background opacity-40 cursor-not-allowed'
                  }`}
                >
                  {!userPos ? t('route.need_gps') : t('route.select_destination')}
                </button>

                {/* Offline Maps Downloader */}
                <div className="pt-2 border-t border-border mt-2">
                  <button
                    onClick={handleDownloadArea}
                    disabled={isDownloading}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isOfflineReady 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' 
                        : 'bg-slate-500/5 border-slate-500/20 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOfflineReady ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                        {isDownloading ? (
                           <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : (
                           <Download className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest">
                          {isOfflineReady ? 'Carte Offline Prête' : 'Zone non téléchargée'}
                        </div>
                        <div className="text-[9px] opacity-70">
                          {isDownloading ? `Téléchargement... ${downloadProgress}%` : 'Rayon de 50km · Zooom 10-14'}
                        </div>
                      </div>
                    </div>
                    {isOfflineReady && <ShieldCheck className="w-4 h-4" />}
                  </button>
                </div>

                {/* Saved plans section */}
                {savedPlans.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowSaved(!showSaved)}
                      className="text-xs text-muted hover:text-foreground flex items-center gap-1"
                    >
                      {t('route.saved_plans')} ({savedPlans.length})
                      <span className={`transition-transform ${showSaved ? 'rotate-180' : ''}`}>&#9662;</span>
                    </button>
                    {showSaved && (
                      <div className="mt-2 space-y-1.5">
                        {savedPlans.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <button
                              onClick={() => handleLoadPlan(p)}
                              className="flex-1 text-left text-xs rounded border border-border p-2 hover:bg-foreground/5 transition-colors"
                            >
                              <span className="font-medium">{p.distance_km} km</span>
                              <span className="text-muted ml-2">{formatDuration(p.duration_min)}</span>
                              <span className="text-muted ml-2">{new Date(p.created_at).toLocaleDateString()}</span>
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.id)}
                              className="text-xs text-muted hover:text-red-500 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* State: destination selected, ready to calculate */}
            {routingState === 'selecting' && destination && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm">{t('route.destination_set')}</h2>
                  <button onClick={cancelRouting} className="text-xs text-muted hover:text-foreground">
                    {t('route.cancel')}
                  </button>
                </div>
                {routeError && (
                  <p className="text-xs text-red-500">{routeError}</p>
                )}
                <button
                  onClick={calculateRoute}
                  className="w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('route.calculate')}
                </button>
              </>
            )}

            {/* State: calculating */}
            {routingState === 'calculating' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-sm text-muted">{t('route.calculating')}</span>
              </div>
            )}

            {/* State: showing routes */}
            {routingState === 'showing' && routes.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm">
                    {routes.length} {t('route.routes_found')}
                  </h2>
                  <button onClick={cancelRouting} className="text-xs text-muted hover:text-foreground">
                    {t('route.new_route')}
                  </button>
                </div>
                <div className="space-y-2">
                  {routes.map((r) => (
                    <button
                      key={r.index}
                      onClick={() => selectRoute(r.index)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedRoute === r.index
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-border hover:bg-foreground/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {r.index === 0 ? t('route.fastest') : `${t('route.alternative')} ${r.index}`}
                        </span>
                        <span className="text-xs font-mono text-muted">
                          {r.distance_km} km
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {formatDuration(r.duration_min)}
                      </div>
                    </button>
                  ))}
                </div>
                {/* Route stops / services */}
                <div>
                  <button
                    onClick={() => setShowStops(!showStops)}
                    className="w-full text-left text-xs flex items-center justify-between py-1.5 text-muted hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>⛽🔌🏥</span>
                      <span className="font-medium">{t('route.stops')}</span>
                      {stopsLoading && <span className="h-3 w-3 rounded-full border border-blue-500 border-t-transparent animate-spin" />}
                      {!stopsLoading && stops.length > 0 && (
                        <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded">{stops.length}</span>
                      )}
                    </span>
                    <span className={`transition-transform text-[10px] ${showStops ? 'rotate-180' : ''}`}>&#9662;</span>
                  </button>
                  {showStops && (
                    <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
                      {stopsLoading && (
                        <p className="text-[11px] text-muted animate-pulse py-2 text-center">{t('route.loading_stops')}</p>
                      )}
                      {!stopsLoading && stops.length === 0 && (
                        <p className="text-[11px] text-muted py-2 text-center">{t('route.no_stops')}</p>
                      )}
                      {stops.map((stop) => (
                        <button
                          key={stop.id}
                          onClick={() => {
                            const map = mapRef.current
                            if (map) map.flyTo({ center: [stop.lon, stop.lat], zoom: 14 })
                          }}
                          className="w-full text-left flex items-start gap-2 rounded border border-border p-2 hover:bg-foreground/5 transition-colors"
                        >
                          <span className="text-sm flex-shrink-0 mt-0.5">{getStopIcon(stop.type)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium truncate">
                              {stop.name || t(`route.${stop.type}`)}
                            </p>
                            {stop.details && (
                              <p className="text-[10px] text-muted truncate">{stop.details}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-muted flex-shrink-0 tabular-nums">
                            ~{stop.distance_km} km
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSavePlan}
                  className="w-full h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {t('route.save_plan')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
