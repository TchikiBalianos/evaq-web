import { describe, it, expect } from 'vitest'
import { haversine, computeDefcon, enrichAlertsWithDistance } from '../defcon'

// ─── haversine ────────────────────────────────────────────────────────────────

describe('haversine', () => {
  it('retourne 0 pour deux points identiques', () => {
    expect(haversine(48.85, 2.35, 48.85, 2.35)).toBe(0)
  })

  it('Paris → Londres ≈ 340 km', () => {
    const d = haversine(48.8566, 2.3522, 51.5074, -0.1278)
    expect(d).toBeGreaterThan(330)
    expect(d).toBeLessThan(350)
  })

  it('Paris → New York ≈ 5 837 km', () => {
    const d = haversine(48.8566, 2.3522, 40.7128, -74.006)
    expect(d).toBeGreaterThan(5700)
    expect(d).toBeLessThan(5950)
  })

  it('est symétrique', () => {
    const d1 = haversine(48.85, 2.35, 51.5, -0.12)
    const d2 = haversine(51.5, -0.12, 48.85, 2.35)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001)
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAlert(
  overrides: Partial<{
    id: string
    event_type: string
    severity: number
    score_fiabilite: number
    distance_km: number
    radius_km: number
  }> = {}
) {
  return {
    id: 'test-id',
    title: 'Test alert',
    event_type: 'EQ',
    severity: 3,
    score_fiabilite: 90,
    latitude: 48,
    longitude: 2,
    radius_km: 100,
    distance_km: 50,
    created_at: new Date().toISOString(),
    is_active: true,
    ...overrides,
  }
}

// ─── computeDefcon — liste vide ───────────────────────────────────────────────

describe('computeDefcon — liste vide', () => {
  it('retourne DEFCON 5 si aucune alerte', () => {
    const { level, topAlerts } = computeDefcon([])
    expect(level).toBe(5)
    expect(topAlerts).toHaveLength(0)
  })
})

// ─── computeDefcon — zone d'impact directe (ratio ≤ 1) ───────────────────────

describe('zone d\'impact directe (ratio ≤ 1)', () => {
  it('séisme severity 5 dans la zone → DEFCON 1', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'EQ', severity: 5, distance_km: 50, radius_km: 100 })])
    expect(level).toBe(1)
  })

  it('séisme severity 4 dans la zone → DEFCON 1', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'EQ', severity: 4, distance_km: 80, radius_km: 100 })])
    expect(level).toBe(1)
  })

  it('inondation severity 3 dans la zone → DEFCON 2', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'FL', severity: 3, distance_km: 50, radius_km: 200 })])
    expect(level).toBe(2)
  })

  it('conflit severity 2 dans la zone → DEFCON 3', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 2, distance_km: 30, radius_km: 100 })])
    expect(level).toBe(3)
  })
})

// ─── computeDefcon — zone périphérique (ratio 1–3) ───────────────────────────

describe('zone périphérique (ratio 1–3)', () => {
  // Conflit (high) : comportement complet
  it('conflit severity 4, ratio 2 → DEFCON 2', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 4, distance_km: 200, radius_km: 100 })])
    expect(level).toBe(2)
  })

  it('conflit severity 3, ratio 2 → DEFCON 3', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 3, distance_km: 200, radius_km: 100 })])
    expect(level).toBe(3)
  })

  it('conflit severity 2, ratio 2 → DEFCON 4', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 2, distance_km: 200, radius_km: 100 })])
    expect(level).toBe(4)
  })

  // Séisme (medium) : plafonné à 3–4 hors zone directe
  it('séisme severity 4, ratio 2 → DEFCON 3 (pas 2)', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'EQ', severity: 4, distance_km: 200, radius_km: 100 })])
    expect(level).toBe(3)
  })

  it('séisme severity 2, ratio 2 → DEFCON 4', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'EQ', severity: 2, distance_km: 200, radius_km: 100 })])
    expect(level).toBe(4)
  })
})

// ─── computeDefcon — zone éloignée (ratio 3–5) ────────────────────────────────

describe('zone éloignée (ratio 3–5)', () => {
  it('conflit severity 4, ratio 4 → DEFCON 3', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 4, distance_km: 400, radius_km: 100 })])
    expect(level).toBe(3)
  })

  it('conflit severity 2, ratio 4 → DEFCON 4', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 2, distance_km: 400, radius_km: 100 })])
    expect(level).toBe(4)
  })

  it('séisme severity 4, ratio 4 → DEFCON 5 (événement localisé)', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'EQ', severity: 4, distance_km: 400, radius_km: 100 })])
    expect(level).toBe(5)
  })
})

// ─── computeDefcon — hors zone (ratio > 5) ────────────────────────────────────

describe('hors zone (ratio > 5)', () => {
  it('n\'importe quel type, ratio 10 → DEFCON 5', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'CONFLICT', severity: 5, distance_km: 1000, radius_km: 100 })])
    expect(level).toBe(5)
  })
})

// ─── Sécheresse (low risk) ────────────────────────────────────────────────────

describe('sécheresse — risque faible (DR)', () => {
  it('sécheresse severity 4 dans la zone → DEFCON 4 max (pas 1)', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'DR', severity: 4, distance_km: 50, radius_km: 100 })])
    expect(level).toBe(4)
  })

  it('sécheresse severity 3 dans la zone → DEFCON 5', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'DR', severity: 3, distance_km: 50, radius_km: 100 })])
    expect(level).toBe(5)
  })

  it('sécheresse hors zone directe (ratio > 1) → DEFCON 5', () => {
    // Cas réel : sécheresse Europe à 954 km, radius 3000 km
    const { level } = computeDefcon([makeAlert({ event_type: 'DR', severity: 3, distance_km: 954, radius_km: 3000 })])
    expect(level).toBe(5)
  })

  it('sécheresse lointaine severity 2 → DEFCON 5', () => {
    const { level } = computeDefcon([makeAlert({ event_type: 'DR', severity: 2, distance_km: 500, radius_km: 200 })])
    expect(level).toBe(5)
  })
})

// ─── computeDefcon — pire niveau parmi plusieurs alertes ─────────────────────

describe('pire niveau parmi plusieurs alertes', () => {
  it('prend le niveau le plus bas (le plus grave)', () => {
    const alerts = [
      makeAlert({ id: 'a1', event_type: 'EQ', severity: 2, distance_km: 500, radius_km: 100 }), // DEFCON 5
      makeAlert({ id: 'a2', event_type: 'CONFLICT', severity: 4, distance_km: 200, radius_km: 100 }), // DEFCON 2
      makeAlert({ id: 'a3', event_type: 'FL', severity: 1, distance_km: 50, radius_km: 100 }), // DEFCON 3
    ]
    const { level, topAlerts } = computeDefcon(alerts)
    expect(level).toBe(2)
    expect(topAlerts[0].id).toBe('a2')
  })

  it('topAlerts exclut les alertes DEFCON 5', () => {
    const alerts = [
      makeAlert({ id: 'a1', event_type: 'EQ', severity: 1, distance_km: 2000, radius_km: 100 }), // hors zone → 5
      makeAlert({ id: 'a2', event_type: 'CONFLICT', severity: 3, distance_km: 200, radius_km: 100 }), // DEFCON 3
    ]
    const { topAlerts } = computeDefcon(alerts)
    expect(topAlerts.map((a) => a.id)).not.toContain('a1')
    expect(topAlerts.map((a) => a.id)).toContain('a2')
  })

  it('topAlerts limité à 5 entrées', () => {
    const alerts = Array.from({ length: 10 }, (_, i) =>
      makeAlert({ id: `a${i}`, event_type: 'CONFLICT', severity: 3, distance_km: 200, radius_km: 100 })
    )
    const { topAlerts } = computeDefcon(alerts)
    expect(topAlerts.length).toBeLessThanOrEqual(5)
  })
})

// ─── enrichAlertsWithDistance ─────────────────────────────────────────────────

describe('enrichAlertsWithDistance', () => {
  it('calcule la distance correctement', () => {
    const rawAlerts = [{
      id: 'x', title: 'T', event_type: 'EQ', severity: 3,
      score_fiabilite: 90, latitude: 51.5074, longitude: -0.1278,
      radius_km: 100, created_at: '', is_active: true,
    }]
    // Depuis Paris vers Londres
    const enriched = enrichAlertsWithDistance(rawAlerts, 48.8566, 2.3522)
    expect(enriched[0].distance_km).toBeGreaterThan(330)
    expect(enriched[0].distance_km).toBeLessThan(350)
  })
})
