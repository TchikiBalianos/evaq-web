import { describe, it, expect } from 'vitest'
import { THREAT_GUIDES, getGuideForEvent } from '../threat-guides'

describe('threat-guides', () => {
  it('couvre tous les types d\'événements principaux', () => {
    const types = ['EQ', 'FL', 'TC', 'NUCLEAR', 'CHEMICAL', 'CONFLICT', 'HEALTH', 'WF', 'VO', 'DR']
    for (const type of types) {
      const guide = getGuideForEvent(type)
      expect(guide, `Guide manquant pour ${type}`).toBeDefined()
    }
  })

  it('chaque guide a au moins 3 actions FR et EN', () => {
    for (const guide of THREAT_GUIDES) {
      expect(guide.actions_fr.length, `${guide.event_type} FR`).toBeGreaterThanOrEqual(3)
      expect(guide.actions_en.length, `${guide.event_type} EN`).toBeGreaterThanOrEqual(3)
    }
  })

  it('chaque guide a un titre FR, EN, icône et source', () => {
    for (const guide of THREAT_GUIDES) {
      expect(guide.title_fr).toBeTruthy()
      expect(guide.title_en).toBeTruthy()
      expect(guide.icon).toBeTruthy()
      expect(guide.source).toBeTruthy()
    }
  })

  it('getGuideForEvent retourne undefined pour un type inconnu', () => {
    expect(getGuideForEvent('UNKNOWN')).toBeUndefined()
  })
})
