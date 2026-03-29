/**
 * Base de connaissances du kit de survie.
 * Recommandations basées sur les guides SGDSN, Croix-Rouge, et ORSEC.
 * Chaque item a une priorité (1=essentiel, 2=important, 3=recommandé)
 * et peut être spécifique à un type de menace.
 */

export type KitCategory = 'water' | 'food' | 'medical' | 'tools' | 'documents' | 'communication'

export interface RecommendedItem {
  id: string
  category: KitCategory
  title_fr: string
  title_en: string
  quantity_per_adult: number
  unit: string
  priority: 1 | 2 | 3
  threat_specific?: string[] // Si vide/absent = universel
  shelf_life_days?: number   // Durée de conservation
  source: string
}

export const KIT_CATEGORIES: { key: KitCategory; icon: string }[] = [
  { key: 'water', icon: '💧' },
  { key: 'food', icon: '🥫' },
  { key: 'medical', icon: '🩹' },
  { key: 'tools', icon: '🔦' },
  { key: 'documents', icon: '📄' },
  { key: 'communication', icon: '📻' },
]

export const RECOMMENDED_ITEMS: RecommendedItem[] = [
  // ── Eau ──────────────────────────────────────────────────
  { id: 'water-bottles', category: 'water', title_fr: 'Eau potable (6L/personne pour 3 jours)', title_en: 'Drinking water (6L/person for 3 days)', quantity_per_adult: 6, unit: 'L', priority: 1, shelf_life_days: 365, source: 'SGDSN - Guide de préparation aux risques' },
  { id: 'water-purification', category: 'water', title_fr: 'Pastilles de purification d\'eau', title_en: 'Water purification tablets', quantity_per_adult: 1, unit: 'boîte', priority: 2, source: 'Croix-Rouge' },
  { id: 'water-container', category: 'water', title_fr: 'Jerrycan pliable 10L', title_en: 'Collapsible water container 10L', quantity_per_adult: 1, unit: 'unité', priority: 3, source: 'ORSEC' },

  // ── Nourriture ──────────────────────────────────────────
  { id: 'food-canned', category: 'food', title_fr: 'Conserves (3 jours)', title_en: 'Canned food (3 days)', quantity_per_adult: 6, unit: 'boîtes', priority: 1, shelf_life_days: 730, source: 'SGDSN' },
  { id: 'food-bars', category: 'food', title_fr: 'Barres énergétiques', title_en: 'Energy bars', quantity_per_adult: 6, unit: 'barres', priority: 1, shelf_life_days: 365, source: 'Croix-Rouge' },
  { id: 'food-dried', category: 'food', title_fr: 'Fruits secs et noix', title_en: 'Dried fruits and nuts', quantity_per_adult: 500, unit: 'g', priority: 2, shelf_life_days: 180, source: 'SGDSN' },
  { id: 'food-baby', category: 'food', title_fr: 'Alimentation bébé/enfant', title_en: 'Baby/child food', quantity_per_adult: 0, unit: 'selon besoin', priority: 1, source: 'Croix-Rouge' },
  { id: 'food-pet', category: 'food', title_fr: 'Nourriture pour animaux', title_en: 'Pet food', quantity_per_adult: 0, unit: 'selon besoin', priority: 2, source: 'SGDSN' },

  // ── Médical ─────────────────────────────────────────────
  { id: 'med-firstaid', category: 'medical', title_fr: 'Trousse de premiers secours', title_en: 'First aid kit', quantity_per_adult: 1, unit: 'trousse', priority: 1, source: 'Croix-Rouge CataKit' },
  { id: 'med-meds', category: 'medical', title_fr: 'Médicaments habituels (7 jours)', title_en: 'Regular medications (7 days)', quantity_per_adult: 1, unit: 'lot', priority: 1, source: 'SGDSN' },
  { id: 'med-masks', category: 'medical', title_fr: 'Masques FFP2', title_en: 'FFP2 masks', quantity_per_adult: 10, unit: 'masques', priority: 2, threat_specific: ['HEALTH', 'CHEMICAL', 'NUCLEAR', 'VO'], source: 'ARS' },
  { id: 'med-iodine', category: 'medical', title_fr: 'Comprimés d\'iode (KI)', title_en: 'Potassium iodide tablets (KI)', quantity_per_adult: 1, unit: 'boîte', priority: 1, threat_specific: ['NUCLEAR'], source: 'ASN - Instruction iode' },
  { id: 'med-gloves', category: 'medical', title_fr: 'Gants jetables', title_en: 'Disposable gloves', quantity_per_adult: 10, unit: 'paires', priority: 2, source: 'Croix-Rouge' },
  { id: 'med-blanket', category: 'medical', title_fr: 'Couverture de survie', title_en: 'Emergency blanket', quantity_per_adult: 1, unit: 'unité', priority: 1, source: 'SGDSN' },

  // ── Outils ──────────────────────────────────────────────
  { id: 'tool-flashlight', category: 'tools', title_fr: 'Lampe torche + piles', title_en: 'Flashlight + batteries', quantity_per_adult: 1, unit: 'unité', priority: 1, source: 'SGDSN' },
  { id: 'tool-knife', category: 'tools', title_fr: 'Couteau suisse / multioutil', title_en: 'Swiss knife / multitool', quantity_per_adult: 1, unit: 'unité', priority: 2, source: 'SGDSN' },
  { id: 'tool-tape', category: 'tools', title_fr: 'Ruban adhésif large', title_en: 'Wide adhesive tape', quantity_per_adult: 1, unit: 'rouleau', priority: 2, threat_specific: ['CHEMICAL', 'NUCLEAR'], source: 'SGDSN' },
  { id: 'tool-whistle', category: 'tools', title_fr: 'Sifflet de détresse', title_en: 'Emergency whistle', quantity_per_adult: 1, unit: 'unité', priority: 2, source: 'Croix-Rouge' },
  { id: 'tool-lighter', category: 'tools', title_fr: 'Briquet / allumettes étanches', title_en: 'Lighter / waterproof matches', quantity_per_adult: 1, unit: 'unité', priority: 2, source: 'SGDSN' },
  { id: 'tool-rope', category: 'tools', title_fr: 'Corde (10m)', title_en: 'Rope (10m)', quantity_per_adult: 1, unit: 'unité', priority: 3, source: 'ORSEC' },
  { id: 'tool-plastic', category: 'tools', title_fr: 'Bâches plastique', title_en: 'Plastic sheeting', quantity_per_adult: 1, unit: 'unité', priority: 2, threat_specific: ['CHEMICAL', 'NUCLEAR', 'FL'], source: 'SGDSN' },

  // ── Documents ───────────────────────────────────────────
  { id: 'doc-id', category: 'documents', title_fr: 'Copie carte d\'identité / passeport', title_en: 'ID / passport copy', quantity_per_adult: 1, unit: 'copie', priority: 1, source: 'SGDSN' },
  { id: 'doc-insurance', category: 'documents', title_fr: 'Copie attestation assurance', title_en: 'Insurance certificate copy', quantity_per_adult: 1, unit: 'copie', priority: 1, source: 'SGDSN' },
  { id: 'doc-medical', category: 'documents', title_fr: 'Ordonnances médicales', title_en: 'Medical prescriptions', quantity_per_adult: 1, unit: 'copie', priority: 1, source: 'Croix-Rouge' },
  { id: 'doc-cash', category: 'documents', title_fr: 'Espèces (petites coupures)', title_en: 'Cash (small bills)', quantity_per_adult: 1, unit: 'lot', priority: 1, source: 'SGDSN' },
  { id: 'doc-contacts', category: 'documents', title_fr: 'Liste contacts d\'urgence (papier)', title_en: 'Emergency contacts list (paper)', quantity_per_adult: 1, unit: 'feuille', priority: 1, source: 'SGDSN' },
  { id: 'doc-usb', category: 'documents', title_fr: 'Clé USB avec documents numérisés', title_en: 'USB key with scanned documents', quantity_per_adult: 1, unit: 'unité', priority: 2, source: 'SGDSN' },

  // ── Communication ───────────────────────────────────────
  { id: 'com-radio', category: 'communication', title_fr: 'Radio FM à piles / dynamo', title_en: 'FM radio (battery / crank)', quantity_per_adult: 1, unit: 'unité', priority: 1, source: 'SGDSN' },
  { id: 'com-charger', category: 'communication', title_fr: 'Chargeur externe / powerbank', title_en: 'External charger / powerbank', quantity_per_adult: 1, unit: 'unité', priority: 1, source: 'SGDSN' },
  { id: 'com-cables', category: 'communication', title_fr: 'Câbles de charge (USB-C, Lightning)', title_en: 'Charging cables (USB-C, Lightning)', quantity_per_adult: 1, unit: 'lot', priority: 2, source: 'SGDSN' },
]

/**
 * Filtrer les items recommandés selon le profil et les menaces actives.
 */
export function getRecommendedItems(
  activeThreats: string[],
  hasChildren: boolean,
  hasPets: boolean
): RecommendedItem[] {
  return RECOMMENDED_ITEMS.filter((item) => {
    // Exclure baby food si pas d'enfants
    if (item.id === 'food-baby' && !hasChildren) return false
    // Exclure pet food si pas d'animaux
    if (item.id === 'food-pet' && !hasPets) return false
    // Items universels : toujours inclus
    if (!item.threat_specific || item.threat_specific.length === 0) return true
    // Items spécifiques : inclus si la menace est active
    return item.threat_specific.some((t) => activeThreats.includes(t))
  })
}

/**
 * Calculer le score de préparation (0-100).
 */
export function computePreparationScore(
  userItems: { category: string; title: string }[],
  recommendedItems: RecommendedItem[]
): number {
  if (recommendedItems.length === 0) return 100

  let totalWeight = 0
  let matchedWeight = 0

  for (const rec of recommendedItems) {
    const weight = rec.priority === 1 ? 3 : rec.priority === 2 ? 2 : 1
    totalWeight += weight

    // Vérifier si l'utilisateur a un item correspondant dans la même catégorie
    const hasMatch = userItems.some(
      (u) => u.category === rec.category &&
        u.title.toLowerCase().includes(rec.title_fr.split('(')[0].trim().toLowerCase().slice(0, 10))
    )
    if (hasMatch) matchedWeight += weight
  }

  return Math.round((matchedWeight / totalWeight) * 100)
}
