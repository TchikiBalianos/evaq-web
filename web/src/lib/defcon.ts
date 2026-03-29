import type { DefconLevel } from './supabase/types'

const EARTH_RADIUS_KM = 6371

export interface AlertWithDistance {
  id: string
  title: string
  event_type: string
  severity: number
  score_fiabilite: number
  latitude: number
  longitude: number
  radius_km: number
  distance_km: number
  created_at: string
  is_active: boolean
}

// Haversine — distance entre deux points GPS en km
export function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Dangerosité à distance par type d'événement
// 'high'   : risque réel à distance — conflit, cyclone, pandémie (peut se propager/s'étendre)
// 'medium' : événement localisé — séisme, inondation, volcan, feux (dangereux si dans la zone)
// 'low'    : informatif uniquement — sécheresse (aucun danger personnel à distance)
type DistanceRisk = 'high' | 'medium' | 'low'

const EVENT_DISTANCE_RISK: Record<string, DistanceRisk> = {
  TC:       'high',
  CONFLICT: 'high',
  HEALTH:   'high',
  NUCLEAR:  'high',
  CHEMICAL: 'medium',
  CYBER:    'low',
  SHORTAGE: 'low',
  UNREST:   'low',
  EQ:       'medium',
  FL:       'medium',
  VO:       'medium',
  WF:       'medium',
  DR:       'low',
}

// Calcul du niveau DEFCON pour une alerte en fonction de la distance et du type
function alertDefcon(alert: AlertWithDistance): DefconLevel {
  const ratio = alert.distance_km / alert.radius_km
  const risk = EVENT_DISTANCE_RISK[alert.event_type] ?? 'medium'

  // Événements informatifs (ex: sécheresse) : jamais plus alarmant que DEFCON 4
  if (risk === 'low') {
    if (ratio <= 1 && alert.severity >= 4) return 4
    return 5
  }

  // Zone d'impact directe (ratio ≤ 1) : comportement identique pour tous les types
  if (ratio <= 1) {
    if (alert.severity >= 4) return 1
    if (alert.severity >= 3) return 2
    return 3
  }

  // Zone périphérique (1–3× rayon)
  if (ratio <= 3) {
    if (risk === 'high') {
      if (alert.severity >= 4) return 2
      if (alert.severity >= 3) return 3
      return 4
    }
    // Événement localisé : moins alarmant hors de la zone d'impact
    if (alert.severity >= 4) return 3
    return 4
  }

  // Zone éloignée (3–5× rayon)
  if (ratio <= 5) {
    if (risk === 'high' && alert.severity >= 4) return 3
    if (risk === 'high') return 4
    return 5 // Événements localisés : aucun danger à cette distance
  }

  // Hors zone
  return 5
}

// Calcul DEFCON global : le pire niveau parmi toutes les alertes
export function computeDefcon(
  alerts: AlertWithDistance[]
): { level: DefconLevel; topAlerts: AlertWithDistance[] } {
  if (alerts.length === 0) return { level: 5, topAlerts: [] }

  const scored = alerts.map((a) => ({
    ...a,
    defcon: alertDefcon(a),
  }))

  scored.sort((a, b) => a.defcon - b.defcon || a.distance_km - b.distance_km)

  const level = scored[0].defcon as DefconLevel
  const topAlerts = scored
    .filter((a) => a.defcon <= 4)
    .slice(0, 5)
    .map(({ defcon: _, ...rest }) => rest)

  return { level, topAlerts }
}

// Enrichir les alertes avec la distance depuis la position utilisateur
export function enrichAlertsWithDistance(
  alerts: { id: string; title: string; event_type: string; severity: number; score_fiabilite: number; latitude: number; longitude: number; radius_km: number; created_at: string; is_active: boolean }[],
  userLat: number,
  userLon: number
): AlertWithDistance[] {
  return alerts.map((alert) => ({
    ...alert,
    distance_km: haversine(userLat, userLon, alert.latitude, alert.longitude),
  }))
}
