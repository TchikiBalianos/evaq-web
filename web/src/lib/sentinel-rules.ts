/**
 * NLP SENTINEL — Règles de détection de menaces par mots-clés
 * Approche dict+regex (Phase 1c du brief)
 *
 * Chaque règle définit :
 * - event_type : type interne EVAQ
 * - keywords : mots-clés à chercher (regex-friendly)
 * - severity_boost : boost de sévérité quand détecté
 * - radius_km : rayon d'impact estimé
 * - min_keywords : nombre minimum de keywords à trouver pour valider
 */

export interface SentinelRule {
  id: string
  event_type: string
  title_fr: string
  title_en: string
  keywords: string[]      // regex patterns (case-insensitive)
  severity_base: number   // sévérité de base (1-5)
  radius_km: number
  min_keywords: number    // nombre minimum de matches pour trigger
  score_fiabilite: number // fiabilité de base
}

export const SENTINEL_RULES: SentinelRule[] = [
  // ── Conflits et guerres ──
  {
    id: 'conflict-war',
    event_type: 'CONFLICT',
    title_fr: 'Conflit armé',
    title_en: 'Armed conflict',
    keywords: [
      'war', 'guerre', 'conflict', 'conflit',
      'missile', 'frappe', 'strike', 'bombing', 'bombardment', 'bombardement',
      'military', 'militaire', 'troops', 'troupes',
      'invasion', 'offensive', 'combat',
      'killed', 'casualties', 'victimes', 'morts',
    ],
    severity_base: 4,
    radius_km: 300,
    min_keywords: 2,
    score_fiabilite: 65,
  },
  {
    id: 'conflict-terror',
    event_type: 'CONFLICT',
    title_fr: 'Menace terroriste',
    title_en: 'Terror threat',
    keywords: [
      'terror', 'terroris', 'attentat', 'attack',
      'vigipirate', 'alerte attentat', 'threat level',
      'bombe', 'bomb', 'explosion', 'hostage', 'otage',
      'radicalisation', 'extremis',
    ],
    severity_base: 4,
    radius_km: 100,
    min_keywords: 2,
    score_fiabilite: 60,
  },

  // ── Nucléaire / Radiologique ──
  {
    id: 'nuclear',
    event_type: 'NUCLEAR',
    title_fr: 'Menace nucléaire',
    title_en: 'Nuclear threat',
    keywords: [
      'nucl[eé]aire', 'nuclear', 'radioact', 'radiation',
      'enrichissement', 'enrichment', 'uranium',
      'ogive', 'warhead', 'arme atomique', 'atomic weapon',
      'tchernobyl', 'fukushima', 'INES',
      'iode', 'iodine', 'retomb[eé]es',
    ],
    severity_base: 5,
    radius_km: 500,
    min_keywords: 2,
    score_fiabilite: 55,
  },

  // ── Chimique / Industriel ──
  {
    id: 'chemical',
    event_type: 'CHEMICAL',
    title_fr: 'Risque chimique',
    title_en: 'Chemical hazard',
    keywords: [
      'chimiqu', 'chemical', 'toxic', 'toxiqu',
      'fuite de gaz', 'gas leak', 'explosion industrielle', 'industrial explosion',
      'seveso', 'usine', 'factory', 'contamination',
      'PPRT', 'périmètre de sécurité', 'security perimeter',
    ],
    severity_base: 3,
    radius_km: 30,
    min_keywords: 2,
    score_fiabilite: 60,
  },

  // ── Pénuries ──
  {
    id: 'shortage-fuel',
    event_type: 'SHORTAGE',
    title_fr: 'Pénurie de carburant',
    title_en: 'Fuel shortage',
    keywords: [
      'p[eé]nurie', 'shortage', 'rationing', 'rationnement',
      'carburant', 'fuel', 'essence', 'gasoline', 'diesel',
      'station.service', 'gas station', 'pompe',
      'approvisionnement', 'supply',
      'grève raffinerie', 'refinery strike',
      'embargo p[eé]trol', 'oil embargo',
    ],
    severity_base: 3,
    radius_km: 500,
    min_keywords: 2,
    score_fiabilite: 60,
  },
  {
    id: 'shortage-food',
    event_type: 'SHORTAGE',
    title_fr: 'Pénurie alimentaire',
    title_en: 'Food shortage',
    keywords: [
      'p[eé]nurie alimentaire', 'food shortage', 'famine',
      'supermarch[eé]', 'supermarket', 'approvisionnement',
      'rayons vides', 'empty shelves',
      'rationnement', 'rationing',
      'chaîne.logistique', 'supply chain',
      'inflation alimentaire', 'food inflation',
    ],
    severity_base: 3,
    radius_km: 500,
    min_keywords: 2,
    score_fiabilite: 55,
  },
  {
    id: 'shortage-power',
    event_type: 'SHORTAGE',
    title_fr: 'Coupure électrique',
    title_en: 'Power outage',
    keywords: [
      'coupure', 'blackout', 'panne', 'outage',
      '[eé]lectricit[eé]', 'electricity', 'power grid',
      'd[eé]lestage', 'load shedding',
      'réseau électrique', 'electrical grid',
    ],
    severity_base: 3,
    radius_km: 200,
    min_keywords: 2,
    score_fiabilite: 60,
  },

  // ── Sanitaire ──
  {
    id: 'health-epidemic',
    event_type: 'HEALTH',
    title_fr: 'Épidémie',
    title_en: 'Epidemic',
    keywords: [
      '[eé]pid[eé]mi', 'epidemic', 'pand[eé]mi', 'pandemic',
      'virus', 'contamination', 'contagion',
      'quarantaine', 'quarantine', 'confinement', 'lockdown',
      'OMS', 'WHO', 'cas confirm[eé]', 'confirmed case',
      'variant', 'souche', 'strain', 'vaccin',
    ],
    severity_base: 3,
    radius_km: 500,
    min_keywords: 2,
    score_fiabilite: 65,
  },

  // ── Catastrophes naturelles (complémentaire GDACS) ──
  {
    id: 'nat-earthquake',
    event_type: 'EQ',
    title_fr: 'Séisme',
    title_en: 'Earthquake',
    keywords: [
      's[eé]isme', 'earthquake', 'tremblement de terre',
      'magnitude', 'richter', 'r[eé]plique', 'aftershock',
      'tsunami',
    ],
    severity_base: 3,
    radius_km: 150,
    min_keywords: 2,
    score_fiabilite: 60,
  },

  // ── Cyber ──
  {
    id: 'cyber',
    event_type: 'CYBER',
    title_fr: 'Cyberattaque',
    title_en: 'Cyber attack',
    keywords: [
      'cyberattaque', 'cyber.attack', 'ransomware', 'rançongiciel',
      'piratage', 'hack', 'DDoS',
      'fuite de donn[eé]es', 'data breach', 'data leak',
      'infrastructure critique', 'critical infrastructure',
      'ANSSI',
    ],
    severity_base: 3,
    radius_km: 1000,
    min_keywords: 2,
    score_fiabilite: 55,
  },
]

/**
 * Analyse un texte (titre + contenu) et retourne les règles SENTINEL déclenchées.
 */
export function analyzeSentinel(text: string): { rule: SentinelRule; matchCount: number; matches: string[] }[] {
  const lower = text.toLowerCase()
  const results: { rule: SentinelRule; matchCount: number; matches: string[] }[] = []

  for (const rule of SENTINEL_RULES) {
    const matches: string[] = []
    for (const kw of rule.keywords) {
      try {
        const re = new RegExp(kw, 'i')
        if (re.test(lower)) matches.push(kw)
      } catch {
        // Si le pattern regex est invalide, fallback en includes
        if (lower.includes(kw.toLowerCase())) matches.push(kw)
      }
    }
    if (matches.length >= rule.min_keywords) {
      results.push({ rule, matchCount: matches.length, matches })
    }
  }

  // Trier par nombre de matches décroissant
  return results.sort((a, b) => b.matchCount - a.matchCount)
}
