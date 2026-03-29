// Génère un polygone GeoJSON approximant un cercle autour d'un point
export function circleGeoJSON(
  centerLon: number,
  centerLat: number,
  radiusKm: number,
  steps = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const dLat = (radiusKm / 111) * Math.sin(angle)
    const dLon = (radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180))) * Math.cos(angle)
    coords.push([centerLon + dLon, centerLat + dLat])
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
}
