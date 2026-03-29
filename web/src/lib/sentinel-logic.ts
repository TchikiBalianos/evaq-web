import { THREAT_GUIDES, getGuideForEvent } from './threat-guides'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const KEYWORD_MAP: Record<string, string> = {
  'nucléaire': 'NUCLEAR',
  'radiation': 'NUCLEAR',
  'atome': 'NUCLEAR',
  'iode': 'NUCLEAR',
  'seisme': 'EQ',
  'tremblement': 'EQ',
  'terre': 'EQ',
  'inondation': 'FL',
  'eau': 'FL',
  'submersion': 'FL',
  'crue': 'FL',
  'cyclone': 'TC',
  'ouragan': 'TC',
  'tempête': 'TC',
  'vent': 'TC',
  'chimique': 'CHEMICAL',
  'gaz': 'CHEMICAL',
  'poison': 'CHEMICAL',
  'conflit': 'CONFLICT',
  'guerre': 'CONFLICT',
  'combat': 'CONFLICT',
  'armée': 'CONFLICT',
  'tir': 'CONFLICT',
  'émeute': 'UNREST',
  'manif': 'UNREST',
  'troubles': 'UNREST',
  'sanitaire': 'HEALTH',
  'virus': 'HEALTH',
  'pandémie': 'HEALTH',
  'maladie': 'HEALTH',
  'feu': 'WF',
  'forêt': 'WF',
  'incendie': 'WF',
  'volcan': 'VO',
  'éruption': 'VO',
  'cendres': 'VO',
  'magma': 'VO',
  'sécheresse': 'DR',
  'canicule': 'DR',
  'pénurie': 'SHORTAGE',
  'nourriture': 'SHORTAGE',
  'carburant': 'SHORTAGE',
  'cyber': 'CYBER',
  'piratage': 'CYBER',
  'hack': 'CYBER',
}

export async function processSentinelQuery(query: string, locale: 'fr' | 'en' = 'fr'): Promise<string> {
  const lowerQuery = query.toLowerCase()
  
  // Simulate network/think delay
  await new Promise(r => setTimeout(r, 1200))

  // 1. Check for specific greetings or general help
  if (lowerQuery.includes('bonjour') || lowerQuery.includes('hello') || lowerQuery.includes('aide')) {
    return locale === 'fr' 
      ? "Bonjour. Je suis SENTINEL, votre conseiller d'urgence. De quelle menace ou situation souhaitez-vous discuter ? (Ex: Risque nucléaire, Inondation, Pénurie...)"
      : "Hello. I am SENTINEL, your emergency advisor. What threat or situation would you like to discuss? (Ex: Nuclear risk, Flood, Shortage...)"
  }

  // 2. Identify threat type from keywords
  let detectedType: string | null = null
  for (const [kw, type] of Object.entries(KEYWORD_MAP)) {
    if (lowerQuery.includes(kw)) {
      detectedType = type
      break
    }
  }

  if (detectedType) {
    const guide = getGuideForEvent(detectedType)
    if (guide) {
      const actions = locale === 'fr' ? guide.actions_fr : guide.actions_en
      const title = locale === 'fr' ? guide.title_fr : guide.title_en
      let response = locale === 'fr' 
        ? `### Protocole : ${title} ${guide.icon}\n\nVoici les mesures d'urgence à appliquer immédiatement :\n\n`
        : `### Protocol: ${title} ${guide.icon}\n\nHere are the emergency measures to apply immediately:\n\n`
      
      actions.forEach(action => {
        response += `- ${action}\n`
      })

      response += `\n\n*Source: ${guide.source}*`
      return response
    }
  }

  // 3. Fallback
  return locale === 'fr'
    ? "Je ne reconnais pas cette situation spécifique dans ma base de connaissances. Veuillez préciser la nature de l'urgence (ex: 'Que faire en cas de séisme ?' ou 'Protocole incendie')."
    : "I do not recognize this specific situation in my knowledge base. Please clarify the nature of the emergency (e.g., 'What to do in an earthquake?' or 'Fire protocol')."
}
