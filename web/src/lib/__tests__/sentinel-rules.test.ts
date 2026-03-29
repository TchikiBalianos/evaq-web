import { describe, it, expect } from 'vitest'
import { analyzeSentinel, SENTINEL_RULES } from '../sentinel-rules'

describe('SENTINEL_RULES — structure', () => {
  it('a au moins 10 règles', () => {
    expect(SENTINEL_RULES.length).toBeGreaterThanOrEqual(10)
  })

  it('chaque règle a un id, event_type, keywords, min_keywords', () => {
    for (const rule of SENTINEL_RULES) {
      expect(rule.id).toBeTruthy()
      expect(rule.event_type).toBeTruthy()
      expect(rule.keywords.length).toBeGreaterThan(0)
      expect(rule.min_keywords).toBeGreaterThanOrEqual(1)
      expect(rule.severity_base).toBeGreaterThanOrEqual(1)
      expect(rule.severity_base).toBeLessThanOrEqual(5)
    }
  })
})

describe('analyzeSentinel — détection', () => {
  it('détecte un conflit armé', () => {
    const results = analyzeSentinel(
      'Russian missile strike hits Ukraine military base, multiple casualties reported'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('CONFLICT')
  })

  it('détecte une menace nucléaire', () => {
    const results = analyzeSentinel(
      'Iran enrichissement uranium : la tension monte autour du programme nucléaire'
    )
    expect(results.length).toBeGreaterThan(0)
    const nuclear = results.find((r) => r.rule.event_type === 'NUCLEAR')
    expect(nuclear).toBeDefined()
  })

  it('détecte une pénurie de carburant', () => {
    const results = analyzeSentinel(
      'Pénurie de carburant : les stations-service à sec, approvisionnement perturbé'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('SHORTAGE')
  })

  it('détecte une pénurie alimentaire', () => {
    const results = analyzeSentinel(
      'Les supermarchés font face à une pénurie alimentaire, rayons vides'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('SHORTAGE')
  })

  it('détecte une épidémie', () => {
    const results = analyzeSentinel(
      'WHO declares pandemic alert: new virus variant spreading rapidly, quarantine measures'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('HEALTH')
  })

  it('détecte une cyberattaque', () => {
    const results = analyzeSentinel(
      'Cyberattaque ransomware contre une infrastructure critique, ANSSI mobilisée'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('CYBER')
  })

  it('détecte un risque chimique', () => {
    const results = analyzeSentinel(
      'Explosion industrielle dans une usine Seveso : fuite de gaz toxique'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('CHEMICAL')
  })

  it('détecte un attentat terroriste', () => {
    const results = analyzeSentinel(
      'Alerte attentat Vigipirate renforcé après une explosion à Paris'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].rule.event_type).toBe('CONFLICT')
  })

  it('ne détecte rien pour un article lambda', () => {
    const results = analyzeSentinel(
      'Le PSG remporte la Ligue des Champions après une saison exceptionnelle'
    )
    expect(results.length).toBe(0)
  })

  it('retourne les matches triés par pertinence', () => {
    const results = analyzeSentinel(
      'War in Ukraine: Russian missile strike on military targets, bombing of Kyiv, multiple troops killed in combat, casualties rising'
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].matchCount).toBeGreaterThanOrEqual(4)
  })
})
