/**
 * Gestion des plans d'évacuation sauvegardés (localStorage).
 * Max 3 plans, FIFO.
 */

const STORAGE_KEY = 'evaq-saved-plans'
const MAX_PLANS = 3

export interface SavedPlan {
  id: string
  created_at: string
  from: [number, number] // [lon, lat]
  to: [number, number]
  distance_km: number
  duration_min: number
  strategy: string
  threat_type: string | null
  geometry: GeoJSON.LineString
}

export function getSavedPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePlan(plan: Omit<SavedPlan, 'id' | 'created_at'>): SavedPlan {
  const plans = getSavedPlans()
  const newPlan: SavedPlan = {
    ...plan,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  plans.unshift(newPlan)
  // Garder seulement les 3 derniers
  const trimmed = plans.slice(0, MAX_PLANS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return newPlan
}

export function deletePlan(id: string): void {
  const plans = getSavedPlans().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}
