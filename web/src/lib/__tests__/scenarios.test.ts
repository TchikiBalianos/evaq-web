import { describe, it, expect } from 'vitest'
import { computeDefcon, enrichAlertsWithDistance, haversine } from '../defcon'
import { getEvacuationAdvice, destinationPoint } from '../evacuation-logic'
import type { WindData } from '../evacuation-logic'

/**
 * 6 scénarios fonctionnels plausibles basés sur l'actualité mondiale 2025-2026.
 * Chaque scénario simule un utilisateur à Paris (48.8566°N, 2.3522°E)
 * face à une menace réelle avec calcul DEFCON + conseil d'évacuation.
 */

const PARIS = { lat: 48.8566, lon: 2.3522 }

function makeRawAlert(o: {
  id: string; title: string; event_type: string; severity: number;
  latitude: number; longitude: number; radius_km: number;
}) {
  return {
    ...o,
    score_fiabilite: 90,
    created_at: new Date().toISOString(),
    is_active: true,
  }
}

// ─── Scénario 1 : Escalade Russie–OTAN — frappes conventionnelles en Pologne ─

describe('Scénario 1 : Conflit Russie–OTAN (frappes en Pologne)', () => {
  const alerts = [
    makeRawAlert({
      id: 'russia-poland',
      title: 'Conflict in Poland',
      event_type: 'CONFLICT',
      severity: 5,
      latitude: 52.23, longitude: 21.01, // Varsovie
      radius_km: 500,
    }),
  ]

  it('DEFCON 2 — danger significatif (conflit severity 5, ~1400km, ratio ~2.8)', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    expect(enriched[0].distance_km).toBeGreaterThan(1300)
    expect(enriched[0].distance_km).toBeLessThan(1500)

    const { level } = computeDefcon(enriched)
    expect(level).toBe(2) // ratio ~2.8, high risk, severity 5 → DEFCON 2
  })

  it('conseil : fuir à l\'opposé de Varsovie (vers le sud-ouest)', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    const advice = getEvacuationAdvice(PARIS.lat, PARIS.lon, {
      event_type: 'CONFLICT', severity: 5,
      latitude: 52.23, longitude: 21.01, radius_km: 500,
    }, null)
    expect(advice.strategy).toBe('flee_opposite')
    // Varsovie est au NE de Paris → fuite vers le SO
    expect(advice.suggested_bearing_deg).toBeGreaterThan(200)
    expect(advice.suggested_bearing_deg).toBeLessThan(260)
  })
})

// ─── Scénario 2 : Menace nucléaire Iran — tir balistique vers l'Europe ──────

describe('Scénario 2 : Menace nucléaire (tir balistique Iran)', () => {
  const alerts = [
    makeRawAlert({
      id: 'iran-nuclear',
      title: 'Nuclear threat — ballistic missile detected',
      event_type: 'NUCLEAR',
      severity: 5,
      latitude: 46.0, longitude: 10.0, // Impact estimé nord Italie
      radius_km: 300,
    }),
  ]
  const westWind: WindData = { speed_kmh: 30, direction_deg: 270 } // Vent d'ouest

  it('conseil : fuir face au vent (vers l\'ouest, loin des retombées)', () => {
    const advice = getEvacuationAdvice(PARIS.lat, PARIS.lon, {
      event_type: 'NUCLEAR', severity: 5,
      latitude: 46.0, longitude: 10.0, radius_km: 300,
    }, westWind)
    expect(advice.strategy).toBe('flee_upwind')
    expect(advice.suggested_bearing_deg).toBe(270) // Fuir vers l'ouest
    expect(advice.min_distance_km).toBe(100)
  })

  it('destination suggérée : ~100km à l\'ouest de Paris (vers la Bretagne)', () => {
    const [lon, lat] = destinationPoint(PARIS.lat, PARIS.lon, 270, 100)
    expect(lon).toBeLessThan(PARIS.lon) // Plus à l'ouest
    expect(Math.abs(lat - PARIS.lat)).toBeLessThan(0.5) // Latitude similaire
  })
})

// ─── Scénario 3 : Attaque chimique — incident industriel Seveso ─────────────

describe('Scénario 3 : Menace chimique (accident industriel Rouen)', () => {
  const alerts = [
    makeRawAlert({
      id: 'rouen-chemical',
      title: 'Chemical incident in France',
      event_type: 'CHEMICAL',
      severity: 4,
      latitude: 49.4431, longitude: 1.0993, // Rouen
      radius_km: 50,
    }),
  ]
  const southWind: WindData = { speed_kmh: 15, direction_deg: 180 } // Vent du sud

  it('DEFCON 3 — alerte active (ratio ~1.5, medium risk, severity 4)', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    const dist = enriched[0].distance_km
    expect(dist).toBeGreaterThan(100)
    expect(dist).toBeLessThan(140)

    // Note: CHEMICAL n'est pas dans EVENT_DISTANCE_RISK → default 'medium'
    // ratio ~2.4 (120/50), severity 4 → DEFCON 3
    const { level } = computeDefcon(enriched)
    expect(level).toBe(3)
  })

  it('conseil : fuir perpendiculairement au vent', () => {
    const advice = getEvacuationAdvice(PARIS.lat, PARIS.lon, {
      event_type: 'CHEMICAL', severity: 4,
      latitude: 49.4431, longitude: 1.0993, radius_km: 50,
    }, southWind)
    expect(advice.strategy).toBe('flee_perpendicular_wind')
    expect(advice.min_distance_km).toBe(30)
  })
})

// ─── Scénario 4 : Inondation catastrophique — crue de la Seine ──────────────

describe('Scénario 4 : Inondation (crue centennale Seine)', () => {
  const alerts = [
    makeRawAlert({
      id: 'seine-flood',
      title: 'Flood in France',
      event_type: 'FL',
      severity: 4,
      latitude: 48.85, longitude: 2.35, // Paris centre
      radius_km: 80,
    }),
  ]

  it('DEFCON 1 — danger immédiat (dans la zone, severity 4)', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    expect(enriched[0].distance_km).toBeLessThan(1) // Quasi sur l'épicentre

    const { level } = computeDefcon(enriched)
    expect(level).toBe(1) // ratio ~0, severity 4 → DEFCON 1
  })

  it('conseil : rejoindre les hauteurs', () => {
    const advice = getEvacuationAdvice(PARIS.lat, PARIS.lon, {
      event_type: 'FL', severity: 4,
      latitude: 48.85, longitude: 2.35, radius_km: 80,
    }, null)
    expect(advice.strategy).toBe('flee_high_ground')
    expect(advice.min_distance_km).toBeGreaterThanOrEqual(20)
  })
})

// ─── Scénario 5 : Feu de forêt Gironde — propagation rapide par vent d'est ──

describe('Scénario 5 : Feu de forêt (Gironde, vent d\'est)', () => {
  const alerts = [
    makeRawAlert({
      id: 'gironde-fire',
      title: 'Wildfire in France',
      event_type: 'WF',
      severity: 4,
      latitude: 44.83, longitude: -0.57, // Bordeaux
      radius_km: 60,
    }),
  ]
  const eastWind: WindData = { speed_kmh: 40, direction_deg: 90 } // Vent d'est

  it('DEFCON 5 pour Paris — trop loin (>500km)', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    expect(enriched[0].distance_km).toBeGreaterThan(490)

    const { level } = computeDefcon(enriched)
    expect(level).toBe(5)
  })

  it('conseil pour un habitant de Bordeaux : fuir perpendiculairement au vent', () => {
    // Simulons un utilisateur à 20km du feu
    const advice = getEvacuationAdvice(44.90, -0.40, {
      event_type: 'WF', severity: 4,
      latitude: 44.83, longitude: -0.57, radius_km: 60,
    }, eastWind)
    expect(advice.strategy).toBe('flee_perpendicular_wind')
  })
})

// ─── Scénario 6 : Pandémie — crise sanitaire majeure ────────────────────────

describe('Scénario 6 : Crise sanitaire (pandémie)', () => {
  const alerts = [
    makeRawAlert({
      id: 'pandemic-europe',
      title: 'Health emergency in France, Germany, Belgium',
      event_type: 'HEALTH',
      severity: 3,
      latitude: 48.0, longitude: 5.0, // Centre Europe
      radius_km: 2000,
    }),
  ]

  it('DEFCON 2 — dans la zone, high risk, severity 3', () => {
    const enriched = enrichAlertsWithDistance(alerts, PARIS.lat, PARIS.lon)
    // Paris est bien dans le radius de 2000km
    expect(enriched[0].distance_km).toBeLessThan(2000)

    const { level } = computeDefcon(enriched)
    // ratio < 1, severity 3 → DEFCON 2
    expect(level).toBe(2)
  })

  it('conseil : confinement (pas de fuite)', () => {
    const advice = getEvacuationAdvice(PARIS.lat, PARIS.lon, {
      event_type: 'HEALTH', severity: 3,
      latitude: 48.0, longitude: 5.0, radius_km: 2000,
    }, null)
    expect(advice.strategy).toBe('shelter_in_place')
    expect(advice.suggested_bearing_deg).toBeNull()
    expect(advice.min_distance_km).toBe(0)
  })
})
