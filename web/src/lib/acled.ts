import { circleGeoJSON } from '@/lib/geo'

export interface ACLEDConflict {
  id: string
  event_date: string
  event_type: string
  sub_event_type: string
  actor1: string
  location: string
  latitude: number
  longitude: number
  fatalities: number
  notes: string
}

const EVENT_COLORS: Record<string, string> = {
  'Battles': '#ef4444', // Red
  'Explosions/Remote violence': '#f59e0b', // Amber
  'Violence against civilians': '#be185d', // Pink
  'Riots': '#8b5cf6', // Violet
  'Protests': '#10b981', // Emerald
  'Strategic developments': '#6b7280', // Gray
}

const SAMPLE_DATA: ACLEDConflict[] = [
  {
    id: 'ac-1',
    event_date: '2026-03-28',
    event_type: 'Battles',
    sub_event_type: 'Armed clash',
    actor1: 'Forces armées locales',
    location: 'Suresnes — Zone Industrielle',
    latitude: 48.875,
    longitude: 2.225,
    fatalities: 2,
    notes: 'Échanges de tirs signalés près du centre logistique. Zone à éviter absolument.',
  },
  {
    id: 'ac-2',
    event_date: '2026-03-29',
    event_type: 'Riots',
    sub_event_type: 'Violent demonstration',
    actor1: 'Manifestants',
    location: 'Paris — Porte Maillot',
    latitude: 48.878,
    longitude: 2.282,
    fatalities: 0,
    notes: 'Émeutes en cours. Barricades érigées. Usage de gaz lacrymogène.',
  },
  {
    id: 'ac-3',
    event_date: '2026-03-29',
    event_type: 'Explosions/Remote violence',
    sub_event_type: 'Shelling/artillery/missile attack',
    actor1: 'Inconnus',
    location: 'Nanterre — Préfecture',
    latitude: 48.892,
    longitude: 2.215,
    fatalities: 5,
    notes: 'Explosion majeure signalée. Plusieurs victimes. Périmètre de sécurité en place.',
  },
  {
    id: 'ac-4',
    event_date: '2026-03-27',
    event_type: 'Violence against civilians',
    sub_event_type: 'Attack',
    actor1: 'Milice locale',
    location: 'Rueil-Malmaison',
    latitude: 48.876,
    longitude: 2.180,
    fatalities: 1,
    notes: 'Pillage violent d\'un entrepôt alimentaire.',
  },
]

export async function fetchACLEDConflicts(): Promise<ACLEDConflict[]> {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 500))
  return SAMPLE_DATA
}

export function conflictsToGeoJSON(conflicts: ACLEDConflict[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: conflicts.map(c => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.longitude, c.latitude],
      },
      properties: {
        ...c,
        color: EVENT_COLORS[c.event_type] || '#f97316',
      },
    })),
  }
}
