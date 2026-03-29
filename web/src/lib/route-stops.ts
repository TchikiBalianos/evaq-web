/**
 * Recherche de points d'intérêt (POI) le long d'un itinéraire
 * via Overpass API (OpenStreetMap).
 */

export interface RouteStop {
  id: string
  type: 'fuel_station' | 'ev_charger' | 'rest_area' | 'toll' | 'hospital' | 'supermarket'
  name: string
  lat: number
  lon: number
  distance_km: number // distance approximative depuis le départ
  details?: string    // infos supplémentaires (type de carburant, enseigne...)
}

const STOP_ICONS: Record<RouteStop['type'], string> = {
  fuel_station: '⛽',
  ev_charger: '🔌',
  rest_area: '🅿️',
  toll: '🚧',
  hospital: '🏥',
  supermarket: '🛒',
}

export function getStopIcon(type: RouteStop['type']): string {
  return STOP_ICONS[type] ?? '📍'
}

/**
 * Échantillonne des points le long d'une géométrie LineString
 * pour créer une bounding box de recherche.
 */
function sampleRoutePoints(
  coordinates: [number, number][],
  maxPoints = 10
): [number, number][] {
  if (coordinates.length <= maxPoints) return coordinates
  const step = Math.floor(coordinates.length / maxPoints)
  const points: [number, number][] = []
  for (let i = 0; i < coordinates.length; i += step) {
    points.push(coordinates[i])
  }
  if (points[points.length - 1] !== coordinates[coordinates.length - 1]) {
    points.push(coordinates[coordinates.length - 1])
  }
  return points
}

/**
 * Calcule la distance approximative d'un point par rapport
 * au début de la route.
 */
function distanceAlongRoute(
  point: [number, number],
  coordinates: [number, number][]
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Trouver le segment le plus proche du point
  let minDist = Infinity
  let closestIndex = 0
  for (let i = 0; i < coordinates.length; i++) {
    const d = haversine(point[1], point[0], coordinates[i][1], coordinates[i][0])
    if (d < minDist) {
      minDist = d
      closestIndex = i
    }
  }

  // Calculer la distance cumulée jusqu'à ce segment
  let totalDist = 0
  for (let i = 1; i <= closestIndex; i++) {
    totalDist += haversine(
      coordinates[i - 1][1], coordinates[i - 1][0],
      coordinates[i][1], coordinates[i][0]
    )
  }

  return Math.round(totalDist * 10) / 10
}

/**
 * Recherche des POI le long d'un itinéraire via Overpass API.
 * Utilise un buffer de ~2km autour de la route.
 */
export async function fetchRouteStops(
  geometry: GeoJSON.LineString,
  signal?: AbortSignal
): Promise<RouteStop[]> {
  const coords = geometry.coordinates as [number, number][]
  const sampled = sampleRoutePoints(coords, 8)

  // Créer un polygone buffer simplifié (union des bbox autour des points échantillonnés)
  // On utilise un around filter dans Overpass
  const aroundPoints = sampled.map(([lon, lat]) => `${lat},${lon}`).join(',')
  const bufferM = 2000 // 2km buffer

  // Requête Overpass compacte
  const query = `
[out:json][timeout:15];
(
  node["amenity"="fuel"](around:${bufferM},${aroundPoints});
  node["amenity"="charging_station"](around:${bufferM},${aroundPoints});
  node["highway"="rest_area"](around:${bufferM},${aroundPoints});
  node["highway"="services"](around:${bufferM},${aroundPoints});
  node["barrier"="toll_booth"](around:${bufferM},${aroundPoints});
  node["amenity"="hospital"](around:${bufferM},${aroundPoints});
  node["shop"="supermarket"](around:${bufferM},${aroundPoints});
);
out body 100;
`.trim()

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal,
  })

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`)
  const data = await res.json()

  const stops: RouteStop[] = []

  for (const element of data.elements ?? []) {
    if (!element.lat || !element.lon) continue

    const tags = element.tags ?? {}
    let type: RouteStop['type']
    let details = ''

    if (tags.amenity === 'fuel') {
      type = 'fuel_station'
      const brand = tags.brand ?? tags.operator ?? tags.name ?? ''
      const fuels: string[] = []
      if (tags['fuel:diesel'] === 'yes') fuels.push('Diesel')
      if (tags['fuel:octane_95'] === 'yes' || tags['fuel:e10'] === 'yes') fuels.push('SP95/E10')
      if (tags['fuel:octane_98'] === 'yes' || tags['fuel:e5'] === 'yes') fuels.push('SP98')
      if (tags['fuel:lpg'] === 'yes') fuels.push('GPL')
      details = [brand, fuels.join(', ')].filter(Boolean).join(' — ')
    } else if (tags.amenity === 'charging_station') {
      type = 'ev_charger'
      const sockets: string[] = []
      if (tags['socket:type2'] || tags['socket:type2_combo']) sockets.push('Type 2')
      if (tags['socket:chademo']) sockets.push('CHAdeMO')
      if (tags['socket:ccs']) sockets.push('CCS')
      const capacity = tags.capacity ? `${tags.capacity} bornes` : ''
      details = [tags.operator ?? tags.brand ?? '', sockets.join(', '), capacity].filter(Boolean).join(' — ')
    } else if (tags.highway === 'rest_area' || tags.highway === 'services') {
      type = 'rest_area'
      details = tags.name ?? ''
    } else if (tags.barrier === 'toll_booth') {
      type = 'toll'
      details = tags.name ?? tags.operator ?? ''
    } else if (tags.amenity === 'hospital') {
      type = 'hospital'
      details = tags.name ?? ''
    } else if (tags.shop === 'supermarket') {
      type = 'supermarket'
      details = tags.brand ?? tags.name ?? ''
    } else {
      continue
    }

    const km = distanceAlongRoute([element.lon, element.lat], coords)

    stops.push({
      id: String(element.id),
      type,
      name: tags.name ?? '',
      lat: element.lat,
      lon: element.lon,
      distance_km: km,
      details: details || undefined,
    })
  }

  // Trier par distance le long de la route
  stops.sort((a, b) => a.distance_km - b.distance_km)

  // Dédupliquer : garder max 3 par type, espacés d'au moins 5km
  const result: RouteStop[] = []
  const countByType: Record<string, number> = {}
  const lastKmByType: Record<string, number> = {}

  for (const stop of stops) {
    const count = countByType[stop.type] ?? 0
    const lastKm = lastKmByType[stop.type] ?? -10

    if (count >= 5) continue
    if (stop.distance_km - lastKm < 3) continue

    result.push(stop)
    countByType[stop.type] = count + 1
    lastKmByType[stop.type] = stop.distance_km
  }

  return result
}
