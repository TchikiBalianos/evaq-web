/**
 * Logique d'évacuation intelligente par type de menace.
 *
 * Règles de direction :
 * - Nucléaire (NUCLEAR)   → fuir dans la direction opposée au vent (100km+)
 * - Chimique (CHEMICAL)   → fuir perpendiculairement au vent
 * - Inondation (FL)       → rejoindre les zones en altitude
 * - Cyclone (TC)          → fuir perpendiculairement à la trajectoire
 * - Conflit (CONFLICT)    → fuir à l'opposé de l'épicentre
 * - Séisme (EQ)           → fuir à l'opposé de l'épicentre (hors zone d'impact)
 * - Volcanique (VO)       → fuir à l'opposé, en évitant le sens du vent (cendres)
 * - Feu de forêt (WF)     → fuir perpendiculairement au vent (propagation)
 * - Sécheresse (DR)       → pas de fuite nécessaire
 * - Santé (HEALTH)        → pas de fuite, confinement recommandé
 */

export interface WindData {
  speed_kmh: number
  direction_deg: number // Direction D'OÙ vient le vent (convention météo)
}

export interface ThreatInfo {
  event_type: string
  latitude: number
  longitude: number
  radius_km: number
  severity: number
}

export interface EvacuationAdvice {
  strategy: 'flee_opposite' | 'flee_perpendicular_wind' | 'flee_upwind' | 'flee_high_ground' | 'shelter_in_place' | 'no_action'
  suggested_bearing_deg: number | null // Cap recommandé (0-360, nord=0)
  min_distance_km: number
  description_key: string // Clé i18n
}

/**
 * Calcule le cap (bearing) de A vers B en degrés.
 */
function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/**
 * Inverse un cap (ajoute 180°).
 */
function oppositeBearing(deg: number): number {
  return (deg + 180) % 360
}

/**
 * Perpendiculaire au vent (direction la plus éloignée de la menace).
 */
function perpendicularToWind(windDeg: number, threatBearing: number): number {
  // Le vent VIENT de windDeg, donc souffle vers (windDeg + 180)
  const windBlows = (windDeg + 180) % 360
  const perp1 = (windBlows + 90) % 360
  const perp2 = (windBlows - 90 + 360) % 360

  // Choisir la perpendiculaire qui s'éloigne le plus de la menace
  const diff1 = Math.abs(((perp1 - threatBearing + 540) % 360) - 180)
  const diff2 = Math.abs(((perp2 - threatBearing + 540) % 360) - 180)
  return diff1 >= diff2 ? perp1 : perp2
}

/**
 * Génère les conseils d'évacuation en fonction du type de menace et du vent.
 */
export function getEvacuationAdvice(
  userLat: number,
  userLon: number,
  threat: ThreatInfo,
  wind: WindData | null
): EvacuationAdvice {
  const threatBearing = bearing(userLat, userLon, threat.latitude, threat.longitude)
  const fleeBearing = oppositeBearing(threatBearing)

  switch (threat.event_type) {
    case 'NUCLEAR':
    case 'CHEMICAL': {
      if (!wind || wind.speed_kmh < 5) {
        // Pas de vent significatif → fuir à l'opposé de la menace
        return {
          strategy: 'flee_opposite',
          suggested_bearing_deg: fleeBearing,
          min_distance_km: threat.event_type === 'NUCLEAR' ? 100 : 30,
          description_key: `evac.${threat.event_type.toLowerCase()}_no_wind`,
        }
      }
      if (threat.event_type === 'NUCLEAR') {
        // Fuir dans la direction opposée au vent (le vent porte les retombées)
        const upwind = wind.direction_deg // Le vent VIENT de là → c'est la direction sûre
        return {
          strategy: 'flee_upwind',
          suggested_bearing_deg: upwind,
          min_distance_km: 100,
          description_key: 'evac.nuclear_upwind',
        }
      }
      // Chimique → perpendiculaire au vent
      return {
        strategy: 'flee_perpendicular_wind',
        suggested_bearing_deg: perpendicularToWind(wind.direction_deg, threatBearing),
        min_distance_km: 30,
        description_key: 'evac.chemical_perpendicular',
      }
    }

    case 'FL':
      return {
        strategy: 'flee_high_ground',
        suggested_bearing_deg: fleeBearing,
        min_distance_km: Math.max(20, threat.radius_km * 0.5),
        description_key: 'evac.flood',
      }

    case 'TC':
      // Cyclone : fuir perpendiculairement à la trajectoire, idéalement à l'opposé
      return {
        strategy: 'flee_perpendicular_wind',
        suggested_bearing_deg: wind
          ? perpendicularToWind(wind.direction_deg, threatBearing)
          : fleeBearing,
        min_distance_km: Math.max(50, threat.radius_km),
        description_key: 'evac.cyclone',
      }

    case 'VO':
      // Volcan : fuir à l'opposé, mais aussi éviter le sens du vent (cendres)
      if (wind && wind.speed_kmh >= 10) {
        return {
          strategy: 'flee_upwind',
          suggested_bearing_deg: wind.direction_deg,
          min_distance_km: Math.max(30, threat.radius_km),
          description_key: 'evac.volcano_wind',
        }
      }
      return {
        strategy: 'flee_opposite',
        suggested_bearing_deg: fleeBearing,
        min_distance_km: Math.max(30, threat.radius_km),
        description_key: 'evac.volcano',
      }

    case 'WF':
      // Feu de forêt : le feu se propage dans le sens du vent
      if (wind && wind.speed_kmh >= 5) {
        return {
          strategy: 'flee_perpendicular_wind',
          suggested_bearing_deg: perpendicularToWind(wind.direction_deg, threatBearing),
          min_distance_km: 20,
          description_key: 'evac.wildfire_wind',
        }
      }
      return {
        strategy: 'flee_opposite',
        suggested_bearing_deg: fleeBearing,
        min_distance_km: 20,
        description_key: 'evac.wildfire',
      }

    case 'CONFLICT':
    case 'EQ':
      return {
        strategy: 'flee_opposite',
        suggested_bearing_deg: fleeBearing,
        min_distance_km: Math.max(30, threat.radius_km * 0.5),
        description_key: `evac.${threat.event_type.toLowerCase()}`,
      }

    case 'HEALTH':
      return {
        strategy: 'shelter_in_place',
        suggested_bearing_deg: null,
        min_distance_km: 0,
        description_key: 'evac.health',
      }

    case 'DR':
    default:
      return {
        strategy: 'no_action',
        suggested_bearing_deg: null,
        min_distance_km: 0,
        description_key: 'evac.no_action',
      }
  }
}

/**
 * Calcule un point de destination à partir d'une position, un cap et une distance.
 */
export function destinationPoint(
  lat: number, lon: number,
  bearingDeg: number, distanceKm: number
): [number, number] {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI

  const d = distanceKm / R
  const brng = toRad(bearingDeg)
  const lat1 = toRad(lat)
  const lon1 = toRad(lon)

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  )
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  )

  return [toDeg(lon2), toDeg(lat2)]
}
