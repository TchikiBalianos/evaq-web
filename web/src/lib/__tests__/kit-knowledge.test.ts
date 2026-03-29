import { describe, it, expect } from 'vitest'
import {
  getRecommendedItems,
  computePreparationScore,
  RECOMMENDED_ITEMS,
  KIT_CATEGORIES,
} from '../kit-knowledge'

describe('kit-knowledge — structure', () => {
  it('a au moins 25 items recommandés', () => {
    expect(RECOMMENDED_ITEMS.length).toBeGreaterThanOrEqual(25)
  })

  it('a 6 catégories', () => {
    expect(KIT_CATEGORIES).toHaveLength(6)
  })

  it('chaque item a un id, catégorie, titre, priorité et source', () => {
    for (const item of RECOMMENDED_ITEMS) {
      expect(item.id).toBeTruthy()
      expect(item.category).toBeTruthy()
      expect(item.title_fr).toBeTruthy()
      expect(item.title_en).toBeTruthy()
      expect([1, 2, 3]).toContain(item.priority)
      expect(item.source).toBeTruthy()
    }
  })
})

describe('getRecommendedItems — filtrage', () => {
  it('exclut baby food sans enfants', () => {
    const items = getRecommendedItems([], false, false)
    expect(items.find((i) => i.id === 'food-baby')).toBeUndefined()
  })

  it('inclut baby food avec enfants', () => {
    const items = getRecommendedItems([], true, false)
    expect(items.find((i) => i.id === 'food-baby')).toBeDefined()
  })

  it('exclut pet food sans animaux', () => {
    const items = getRecommendedItems([], false, false)
    expect(items.find((i) => i.id === 'food-pet')).toBeUndefined()
  })

  it('inclut pet food avec animaux', () => {
    const items = getRecommendedItems([], false, true)
    expect(items.find((i) => i.id === 'food-pet')).toBeDefined()
  })

  it('inclut comprimés iode si menace NUCLEAR', () => {
    const items = getRecommendedItems(['NUCLEAR'], false, false)
    expect(items.find((i) => i.id === 'med-iodine')).toBeDefined()
  })

  it('exclut comprimés iode sans menace NUCLEAR', () => {
    const items = getRecommendedItems(['EQ', 'FL'], false, false)
    expect(items.find((i) => i.id === 'med-iodine')).toBeUndefined()
  })

  it('inclut masques FFP2 si menace HEALTH', () => {
    const items = getRecommendedItems(['HEALTH'], false, false)
    expect(items.find((i) => i.id === 'med-masks')).toBeDefined()
  })

  it('inclut ruban adhésif si menace CHEMICAL', () => {
    const items = getRecommendedItems(['CHEMICAL'], false, false)
    expect(items.find((i) => i.id === 'tool-tape')).toBeDefined()
  })
})

describe('computePreparationScore', () => {
  it('retourne 0 si aucun item', () => {
    const recommended = getRecommendedItems([], false, false)
    expect(computePreparationScore([], recommended)).toBe(0)
  })

  it('retourne 100 si recommandations vides', () => {
    expect(computePreparationScore([], [])).toBe(100)
  })

  it('retourne un score intermédiaire avec items partiels', () => {
    const recommended = getRecommendedItems([], false, false)
    const userItems = [
      { category: 'water', title: 'Eau potable 6L' },
      { category: 'food', title: 'Conserves variées' },
    ]
    const score = computePreparationScore(userItems, recommended)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })
})
