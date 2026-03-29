import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * NLP SENTINEL — Scraping RSS médias + détection de menaces par mots-clés
 * Cron: daily (après GDACS et ReliefWeb)
 *
 * Approche: fetch RSS → parse XML → keyword matching (FR/EN) → geolocation → insert alerts
 */

const CRON_SECRET = process.env.CRON_SECRET

// ── RSS Feeds ──────────────────────────────────────────────────────────────────

const RSS_FEEDS = [
  'https://www.lemonde.fr/international/rss_full.xml',
  'https://www.france24.com/fr/rss',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
]

// ── Threat Keywords Dictionary ─────────────────────────────────────────────────

const THREAT_KEYWORDS: Record<string, { event_type: string; severity: number; keywords_fr: string[]; keywords_en: string[] }> = {
  nuclear: {
    event_type: 'NUCLEAR',
    severity: 5,
    keywords_fr: ['nucléaire', 'bombe atomique', 'ogive nucléaire', 'arme nucléaire', 'radiation', 'contamination radioactive'],
    keywords_en: ['nuclear', 'atomic bomb', 'nuclear warhead', 'nuclear weapon', 'radiation', 'radioactive contamination'],
  },
  conflict_escalation: {
    event_type: 'CONFLICT',
    severity: 4,
    keywords_fr: ['guerre', 'frappe aérienne', 'bombardement', 'offensive militaire', 'invasion', 'mobilisation générale', 'déclaration de guerre', 'escalade militaire', 'missiles balistiques', 'conflit armé'],
    keywords_en: ['war', 'airstrike', 'bombing', 'military offensive', 'invasion', 'general mobilization', 'declaration of war', 'military escalation', 'ballistic missiles', 'armed conflict'],
  },
  terrorism: {
    event_type: 'CONFLICT',
    severity: 4,
    keywords_fr: ['attentat', 'terrorisme', 'vigipirate', 'menace terroriste', 'alerte attentat', 'état d\'urgence'],
    keywords_en: ['terrorist attack', 'terrorism', 'terror threat', 'bomb threat', 'state of emergency'],
  },
  shortage: {
    event_type: 'SHORTAGE',
    severity: 3,
    keywords_fr: ['pénurie', 'rupture d\'approvisionnement', 'rationnement', 'pénurie de carburant', 'pénurie alimentaire', 'rupture de stock', 'crise énergétique'],
    keywords_en: ['shortage', 'supply chain disruption', 'rationing', 'fuel shortage', 'food shortage', 'stockout', 'energy crisis'],
  },
  pandemic: {
    event_type: 'HEALTH',
    severity: 4,
    keywords_fr: ['pandémie', 'épidémie', 'virus', 'confinement', 'quarantaine', 'alerte sanitaire', 'urgence sanitaire'],
    keywords_en: ['pandemic', 'epidemic', 'virus outbreak', 'lockdown', 'quarantine', 'health alert', 'health emergency'],
  },
  chemical: {
    event_type: 'CHEMICAL',
    severity: 4,
    keywords_fr: ['chimique', 'arme chimique', 'fuite chimique', 'explosion industrielle', 'seveso', 'gaz toxique'],
    keywords_en: ['chemical weapon', 'chemical leak', 'industrial explosion', 'toxic gas', 'hazmat'],
  },
  civil_unrest: {
    event_type: 'UNREST',
    severity: 2,
    keywords_fr: ['émeute', 'manifestation violente', 'insurrection', 'troubles civils', 'couvre-feu', 'loi martiale'],
    keywords_en: ['riot', 'violent protest', 'insurrection', 'civil unrest', 'curfew', 'martial law'],
  },
}

// ── Radius par event_type (km) ─────────────────────────────────────────────────

const RADIUS_BY_EVENT_TYPE: Record<string, number> = {
  NUCLEAR: 1000,
  CONFLICT: 500,
  HEALTH: 300,
  SHORTAGE: 200,
  CHEMICAL: 100,
  UNREST: 50,
}

// ── Country → Coordinates Mapping ──────────────────────────────────────────────

const COUNTRY_PATTERNS: { pattern: RegExp; lat: number; lon: number; name: string }[] = [
  { pattern: /\b(ukraine|ukrain|kiev|kyiv)\b/i, lat: 50.45, lon: 30.52, name: 'Ukraine' },
  { pattern: /\b(iran|tehran|t[eé]h[eé]ran)\b/i, lat: 35.69, lon: 51.39, name: 'Iran' },
  { pattern: /\b(isra[eë]l|gaza|cisjordanie|west bank|tel.?aviv)\b/i, lat: 31.05, lon: 34.85, name: 'Israel/Palestine' },
  { pattern: /\b(syria|syrie|damas|damascus)\b/i, lat: 33.51, lon: 36.29, name: 'Syrie' },
  { pattern: /\b(russia|russie|moscou|moscow|kremlin)\b/i, lat: 55.75, lon: 37.62, name: 'Russie' },
  { pattern: /\b(china|chine|beijing|p[eé]kin|shanghai)\b/i, lat: 39.90, lon: 116.40, name: 'Chine' },
  { pattern: /\b(north korea|cor[eé]e du nord|pyongyang)\b/i, lat: 39.04, lon: 125.76, name: 'Corée du Nord' },
  { pattern: /\b(taiwan|ta[ïi]wan|taipei)\b/i, lat: 25.03, lon: 121.57, name: 'Taïwan' },
  { pattern: /\b(france|paris|lyon|marseille)\b/i, lat: 48.86, lon: 2.35, name: 'France' },
  { pattern: /\b(sudan|soudan|khartoum)\b/i, lat: 15.50, lon: 32.56, name: 'Soudan' },
  { pattern: /\b(yemen|y[eé]men|sanaa)\b/i, lat: 15.37, lon: 44.19, name: 'Yémen' },
  { pattern: /\b(afghanistan|kaboul|kabul)\b/i, lat: 34.53, lon: 69.17, name: 'Afghanistan' },
  { pattern: /\b(myanmar|birmanie|rangoon|yangon)\b/i, lat: 16.87, lon: 96.20, name: 'Myanmar' },
  { pattern: /\b(congo|kinshasa|RDC)\b/i, lat: -4.32, lon: 15.31, name: 'RD Congo' },
  { pattern: /\b(ethiopia|[eé]thiopie|addis.?ababa)\b/i, lat: 9.02, lon: 38.75, name: 'Éthiopie' },
  { pattern: /\b(somalia|somalie|mogadiscio|mogadishu)\b/i, lat: 2.05, lon: 45.32, name: 'Somalie' },
  { pattern: /\b(liban|lebanon|beyrouth|beirut)\b/i, lat: 33.89, lon: 35.50, name: 'Liban' },
  { pattern: /\b(iraq|irak|baghdad|bagdad)\b/i, lat: 33.31, lon: 44.37, name: 'Irak' },
  { pattern: /\b(libya|libye|tripoli)\b/i, lat: 32.90, lon: 13.18, name: 'Libye' },
  { pattern: /\b(nigeria|nig[eé]ria|lagos|abuja)\b/i, lat: 9.08, lon: 7.49, name: 'Nigeria' },
  { pattern: /\b(mali|bamako)\b/i, lat: 12.64, lon: -8.00, name: 'Mali' },
  { pattern: /\b(burkina|ouagadougou)\b/i, lat: 12.37, lon: -1.52, name: 'Burkina Faso' },
  { pattern: /\b(niger|niamey)\b/i, lat: 13.51, lon: 2.11, name: 'Niger' },
  { pattern: /\b(pakistan|islamabad|karachi)\b/i, lat: 33.69, lon: 73.04, name: 'Pakistan' },
  { pattern: /\b(india|inde|delhi|mumbai)\b/i, lat: 28.61, lon: 77.21, name: 'Inde' },
  { pattern: /\b(turkey|turquie|t[uü]rkiye|ankara|istanbul)\b/i, lat: 39.93, lon: 32.85, name: 'Turquie' },
  { pattern: /\b(haiti|ha[ïi]ti|port.au.prince)\b/i, lat: 18.54, lon: -72.34, name: 'Haïti' },
  { pattern: /\b(mexico|mexique)\b/i, lat: 19.43, lon: -99.13, name: 'Mexique' },
  { pattern: /\b(venezuela|caracas)\b/i, lat: 10.48, lon: -66.90, name: 'Venezuela' },
  { pattern: /\b(colombia|colombie|bogota)\b/i, lat: 4.71, lon: -74.07, name: 'Colombie' },
  { pattern: /\b(saudi|arabie saoudite|riyadh|riyad)\b/i, lat: 24.71, lon: 46.68, name: 'Arabie Saoudite' },
  { pattern: /\b(egypt|[eé]gypte|cairo|le caire)\b/i, lat: 30.04, lon: 31.24, name: 'Égypte' },
  { pattern: /\b(south korea|cor[eé]e du sud|seoul|s[eé]oul)\b/i, lat: 37.57, lon: 126.98, name: 'Corée du Sud' },
  { pattern: /\b(japan|japon|tokyo)\b/i, lat: 35.68, lon: 139.69, name: 'Japon' },
  { pattern: /\b(germany|allemagne|berlin)\b/i, lat: 52.52, lon: 13.41, name: 'Allemagne' },
  { pattern: /\b(united kingdom|royaume.uni|london|londres)\b/i, lat: 51.51, lon: -0.13, name: 'Royaume-Uni' },
  { pattern: /\b(united states|[eé]tats.unis|washington|new york)\b/i, lat: 38.91, lon: -77.04, name: 'États-Unis' },
  { pattern: /\b(mozambique|maputo)\b/i, lat: -25.97, lon: 32.57, name: 'Mozambique' },
  { pattern: /\b(cameroun|cameroon|yaound[eé])\b/i, lat: 3.87, lon: 11.52, name: 'Cameroun' },
  { pattern: /\b(alg[eé]rie|algeria|alger|algiers)\b/i, lat: 36.75, lon: 3.04, name: 'Algérie' },
  { pattern: /\b(maroc|morocco|rabat|casablanca)\b/i, lat: 33.97, lon: -6.85, name: 'Maroc' },
  { pattern: /\b(tunisie|tunisia|tunis)\b/i, lat: 36.81, lon: 10.17, name: 'Tunisie' },
]

// ── RSS XML Parsing ────────────────────────────────────────────────────────────

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = []

  // RSS 2.0: <item>...</item>
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const description = extractTag(block, 'description') || extractTag(block, 'content:encoded') || ''
    const link = extractTag(block, 'link') || extractTagAttr(block, 'link', 'href')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || ''

    if (title) {
      items.push({
        title: stripHTML(title),
        description: stripHTML(description).slice(0, 1000),
        link: link || '',
        pubDate,
      })
    }
  }

  // Atom fallback: <entry>...</entry>
  if (items.length === 0) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1]
      const title = extractTag(block, 'title')
      const description = extractTag(block, 'summary') || extractTag(block, 'content') || ''
      const link = extractTagAttr(block, 'link', 'href') || extractTag(block, 'link')
      const pubDate = extractTag(block, 'published') || extractTag(block, 'updated') || ''

      if (title) {
        items.push({
          title: stripHTML(title),
          description: stripHTML(description).slice(0, 1000),
          link: link || '',
          pubDate,
        })
      }
    }
  }

  return items
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i')
  const cdataMatch = cdataRegex.exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = regex.exec(xml)
  return m ? m[1].trim() : ''
}

function extractTagAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
  const m = regex.exec(xml)
  return m ? m[1] : ''
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Normalize text for accent-insensitive matching ─────────────────────────────

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// ── Country extraction ─────────────────────────────────────────────────────────

function extractCountry(text: string): { name: string; lat: number; lon: number } | null {
  for (const cp of COUNTRY_PATTERNS) {
    if (cp.pattern.test(text)) {
      return { name: cp.name, lat: cp.lat, lon: cp.lon }
    }
  }
  return null
}

// ── Simple hash for dedup ──────────────────────────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return 'sentinel_' + Math.abs(hash).toString(36)
}

// ── Keyword detection ──────────────────────────────────────────────────────────

interface ThreatMatch {
  rule_key: string
  event_type: string
  severity: number
  matched_keywords: string[]
}

function detectThreats(text: string): ThreatMatch[] {
  const normalized = normalizeText(text)
  const results: ThreatMatch[] = []

  for (const [key, rule] of Object.entries(THREAT_KEYWORDS)) {
    const allKeywords = [...rule.keywords_fr, ...rule.keywords_en]
    const matched: string[] = []

    for (const keyword of allKeywords) {
      const normalizedKeyword = normalizeText(keyword)
      if (normalized.includes(normalizedKeyword)) {
        matched.push(keyword)
      }
    }

    if (matched.length > 0) {
      results.push({
        rule_key: key,
        event_type: rule.event_type,
        severity: rule.severity,
        matched_keywords: matched,
      })
    }
  }

  // Sort by severity descending, then by number of matches descending
  return results.sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity
    return b.matched_keywords.length - a.matched_keywords.length
  })
}

// ── Route Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // 1. Auth check
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Supabase service_role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const runAt = new Date().toISOString()
  let articlesProcessed = 0
  let alertsCreated = 0
  let feedsProcessed = 0
  let feedErrors = 0
  let errorMessage: string | null = null

  try {
    // 3. Fetch all RSS feeds in parallel
    const allItems: { item: RSSItem; feedUrl: string }[] = []

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async (feedUrl) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)
        try {
          const res = await fetch(feedUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'EVAQ-Sentinel/1.0' },
          })
          clearTimeout(timeout)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const xml = await res.text()
          return parseRSS(xml).map((item) => ({ item, feedUrl }))
        } catch {
          clearTimeout(timeout)
          return []
        }
      })
    )

    for (const result of feedResults) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        feedsProcessed++
        allItems.push(...result.value)
      } else {
        feedErrors++
      }
    }

    articlesProcessed = allItems.length

    // Filter articles from the last 48 hours only
    const now = Date.now()
    const cutoff48h = 48 * 60 * 60 * 1000
    const recentItems = allItems.filter(({ item }) => {
      if (!item.pubDate) return true // Keep if no date (assume recent)
      const pubTime = new Date(item.pubDate).getTime()
      return !isNaN(pubTime) && (now - pubTime) < cutoff48h
    })

    // 4. Keyword detection on each article
    const detectedAlerts: {
      title: string
      description: string
      link: string
      pubDate: string
      event_type: string
      severity: number
      matched_keywords: string[]
      rule_key: string
      country: { name: string; lat: number; lon: number }
      feedUrl: string
      hash: string
    }[] = []

    for (const { item, feedUrl } of recentItems) {
      const fullText = `${item.title} ${item.description}`

      // Run keyword detection
      const threats = detectThreats(fullText)
      if (threats.length === 0) continue

      // Take the highest-severity threat
      const best = threats[0]

      // 5. Geolocation: extract country, skip if none found
      const country = extractCountry(fullText)
      if (!country) continue

      // Generate dedup hash from title + pubDate
      const hash = simpleHash(`${item.title}${item.pubDate}`)

      detectedAlerts.push({
        title: item.title.slice(0, 200),
        description: item.description.slice(0, 500),
        link: item.link,
        pubDate: item.pubDate,
        event_type: best.event_type,
        severity: best.severity,
        matched_keywords: best.matched_keywords,
        rule_key: best.rule_key,
        country,
        feedUrl,
        hash,
      })
    }

    // 7. Dedup: check existing hashes in DB
    if (detectedAlerts.length > 0) {
      const hashes = detectedAlerts.map((a) => a.hash)
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('raw_data')
        .eq('source', 'SENTINEL')
        .in('raw_data->>reliefweb_id', hashes)

      const existingHashes = new Set(
        (existingAlerts ?? []).map(
          (a: { raw_data: { reliefweb_id: string } }) => a.raw_data?.reliefweb_id ?? ''
        )
      )

      // 8. Batch insert
      const newAlerts = []

      for (const alert of detectedAlerts) {
        if (existingHashes.has(alert.hash)) continue

        newAlerts.push({
          source: 'SENTINEL',
          event_type: alert.event_type,
          title: alert.title,
          description: alert.description,
          latitude: alert.country.lat,
          longitude: alert.country.lon,
          radius_km: RADIUS_BY_EVENT_TYPE[alert.event_type] ?? 200,
          severity: alert.severity,
          score_fiabilite: 60,
          raw_data: {
            reliefweb_id: alert.hash,
            country: alert.country.name,
            rule_key: alert.rule_key,
            matched_keywords: alert.matched_keywords,
            feed_url: alert.feedUrl,
            link: alert.link,
            pub_date: alert.pubDate,
          },
          is_active: true,
        })
      }

      if (newAlerts.length > 0) {
        const { error } = await supabase.from('alerts').insert(newAlerts)
        if (error) throw new Error(`Supabase insert error: ${error.message}`)
        alertsCreated = newAlerts.length
      }
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[ingest-sentinel]', errorMessage)
  }

  // Log to source_ingestion_logs
  await supabase.from('source_ingestion_logs').insert({
    source: 'SENTINEL',
    run_at: runAt,
    status: errorMessage ? (alertsCreated > 0 ? 'partial' : 'error') : 'success',
    articles_processed: articlesProcessed,
    alerts_created: alertsCreated,
    error_message: errorMessage,
  })

  // 9. Return JSON summary
  return NextResponse.json({
    ok: !errorMessage,
    feedsProcessed,
    feedErrors,
    articlesProcessed,
    alertsCreated,
    error: errorMessage,
  })
}
