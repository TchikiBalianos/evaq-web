import { describe, it, expect, vi, afterEach } from 'vitest'
import { timeAgo } from '../time'

describe('timeAgo', () => {
  afterEach(() => vi.useRealTimers())

  function mockNow(iso: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
  }

  it('retourne "à l\'instant" pour < 1 min (FR)', () => {
    mockNow('2026-03-24T12:00:30Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe("à l'instant")
  })

  it('retourne "just now" pour < 1 min (EN)', () => {
    mockNow('2026-03-24T12:00:30Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'en')).toBe('just now')
  })

  it('retourne minutes (FR)', () => {
    mockNow('2026-03-24T12:15:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe('il y a 15 min')
  })

  it('retourne minutes (EN)', () => {
    mockNow('2026-03-24T12:15:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'en')).toBe('15m ago')
  })

  it('retourne heures (FR)', () => {
    mockNow('2026-03-24T15:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe('il y a 3h')
  })

  it('retourne heures (EN)', () => {
    mockNow('2026-03-24T15:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'en')).toBe('3h ago')
  })

  it('retourne jours (FR)', () => {
    mockNow('2026-03-27T12:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe('il y a 3j')
  })

  it('retourne jours (EN)', () => {
    mockNow('2026-03-27T12:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'en')).toBe('3d ago')
  })

  it('retourne semaines (FR)', () => {
    mockNow('2026-04-07T12:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe('il y a 2 sem.')
  })

  it('retourne mois (FR)', () => {
    mockNow('2026-06-24T12:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe('il y a 3 mois')
  })

  it('gère les dates futures (FR)', () => {
    mockNow('2026-03-24T11:00:00Z')
    expect(timeAgo('2026-03-24T12:00:00Z', 'fr')).toBe("à l'instant")
  })
})
