import { describe, it, expect } from 'vitest'
import { getEvacuationAdvice, destinationPoint } from '../evacuation-logic'
import type { WindData, ThreatInfo } from '../evacuation-logic'

function makeThreat(overrides: Partial<ThreatInfo> = {}): ThreatInfo {
  return {
    event_type: 'EQ',
    latitude: 49,
    longitude: 3,
    radius_km: 100,
    severity: 3,
    ...overrides,
  }
}

const wind: WindData = { speed_kmh: 20, direction_deg: 270 } // Vent d'ouest
const noWind: WindData = { speed_kmh: 2, direction_deg: 0 }

// ─── Strategy selection ─────────────────────────────────────────────────────

describe('getEvacuationAdvice — strategy', () => {
  it('séisme → flee_opposite', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'EQ' }), null)
    expect(advice.strategy).toBe('flee_opposite')
  })

  it('conflit → flee_opposite', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'CONFLICT' }), null)
    expect(advice.strategy).toBe('flee_opposite')
  })

  it('inondation → flee_high_ground', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'FL' }), null)
    expect(advice.strategy).toBe('flee_high_ground')
  })

  it('nucléaire avec vent → flee_upwind', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'NUCLEAR' }), wind)
    expect(advice.strategy).toBe('flee_upwind')
    expect(advice.min_distance_km).toBe(100)
  })

  it('nucléaire sans vent → flee_opposite', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'NUCLEAR' }), noWind)
    expect(advice.strategy).toBe('flee_opposite')
  })

  it('chimique avec vent → flee_perpendicular_wind', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'CHEMICAL' }), wind)
    expect(advice.strategy).toBe('flee_perpendicular_wind')
  })

  it('feu de forêt avec vent → flee_perpendicular_wind', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'WF' }), wind)
    expect(advice.strategy).toBe('flee_perpendicular_wind')
  })

  it('santé → shelter_in_place', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'HEALTH' }), null)
    expect(advice.strategy).toBe('shelter_in_place')
    expect(advice.suggested_bearing_deg).toBeNull()
  })

  it('sécheresse → no_action', () => {
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'DR' }), null)
    expect(advice.strategy).toBe('no_action')
  })
})

// ─── Bearing direction ──────────────────────────────────────────────────────

describe('getEvacuationAdvice — bearing', () => {
  it('flee_opposite est à ~180° de la menace', () => {
    // Menace au nord-est (49°N, 3°E), utilisateur à Paris (48.85°N, 2.35°E)
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat(), null)
    // La menace est au NE → fuite vers le SO (entre 180 et 270)
    expect(advice.suggested_bearing_deg).toBeGreaterThan(180)
    expect(advice.suggested_bearing_deg).toBeLessThan(270)
  })

  it('nucléaire upwind pointe vers la source du vent', () => {
    // Vent d'ouest (270°) → fuir vers l'ouest
    const advice = getEvacuationAdvice(48.85, 2.35, makeThreat({ event_type: 'NUCLEAR' }), wind)
    expect(advice.suggested_bearing_deg).toBe(270)
  })
})

// ─── destinationPoint ───────────────────────────────────────────────────────

describe('destinationPoint', () => {
  it('cap nord 100km depuis Paris → ~49.75°N', () => {
    const [lon, lat] = destinationPoint(48.85, 2.35, 0, 100)
    expect(lat).toBeGreaterThan(49.7)
    expect(lat).toBeLessThan(49.9)
    expect(Math.abs(lon - 2.35)).toBeLessThan(0.01)
  })

  it('cap est 100km → longitude augmente', () => {
    const [lon, lat] = destinationPoint(48.85, 2.35, 90, 100)
    expect(lon).toBeGreaterThan(2.35)
    expect(Math.abs(lat - 48.85)).toBeLessThan(0.1)
  })

  it('distance 0 → même point', () => {
    const [lon, lat] = destinationPoint(48.85, 2.35, 45, 0)
    expect(Math.abs(lon - 2.35)).toBeLessThan(0.001)
    expect(Math.abs(lat - 48.85)).toBeLessThan(0.001)
  })
})
