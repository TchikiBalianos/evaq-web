'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { circleGeoJSON } from '@/lib/geo'

interface AlertMapProps {
  lat: number
  lon: number
  radius_km: number
  severity: number
}

const SEVERITY_COLORS: Record<number, string> = {
  1: '#71717a',
  2: '#eab308',
  3: '#f97316',
  4: '#ef4444',
  5: '#dc2626',
}

function getZoom(radius_km: number): number {
  if (radius_km < 50)   return 8
  if (radius_km < 200)  return 6
  if (radius_km < 800)  return 5
  if (radius_km < 2500) return 4
  return 3
}

export function AlertMap({ lat, lon, radius_km, severity }: AlertMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const color = SEVERITY_COLORS[severity] ?? '#f97316'

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [lon, lat],
      zoom: getZoom(radius_km),
      interactive: false,
      attributionControl: false,
    })

    map.on('load', () => {
      // Cercle d'impact
      map.addSource('impact-zone', {
        type: 'geojson',
        data: circleGeoJSON(lon, lat, radius_km),
      })
      map.addLayer({
        id: 'impact-fill',
        type: 'fill',
        source: 'impact-zone',
        paint: {
          'fill-color': color,
          'fill-opacity': 0.15,
        },
      })
      map.addLayer({
        id: 'impact-border',
        type: 'line',
        source: 'impact-zone',
        paint: {
          'line-color': color,
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      })

      // Marqueur central
      new maplibregl.Marker({ color })
        .setLngLat([lon, lat])
        .addTo(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lon, radius_km, severity])

  return (
    <div
      ref={containerRef}
      style={{ height: '180px', borderRadius: '8px', overflow: 'hidden' }}
      className="mt-2 border border-border"
    />
  )
}
