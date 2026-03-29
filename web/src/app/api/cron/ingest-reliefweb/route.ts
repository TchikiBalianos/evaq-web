import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Ingestion ReliefWeb (OCHA/ONU) — Conflits armés, crises humanitaires, catastrophes
 * API gratuite, pas d'auth requise.
 * Docs: https://apidoc.reliefweb.int/
 *
 * Deux endpoints ingérés :
 *  1. /disasters — catastrophes naturelles + conflits
 *  2. /reports   — rapports récents sur conflits armés / sécurité
 *
 * Cron: daily 6h30 UTC (après GDACS à 6h)
 */

const DISASTERS_URL =
  'https://api.reliefweb.int/v1/disasters?appname=evaq' +
  '&filter[field]=type&filter[value]=armed-conflict,epidemic,flood,earthquake,volcano,storm,drought,fire,technological-disaster' +
  '&fields[include][]=name&fields[include][]=type&fields[include][]=country' +
  '&fields[include][]=date&fields[include][]=glide&fields[include][]=status&fields[include][]=url' +
  '&limit=50&sort[]=date:desc'

const REPORTS_URL =
  'https://api.reliefweb.int/v1/reports?appname=evaq' +
  '&filter[operator]=AND' +
  '&filter[conditions][0][field]=theme' +
  '&filter[conditions][0][value]=Armed Conflict,Peace and Security' +
  '&filter[conditions][1][field]=date.created' +
  '&filter[conditions][1][value][from]=now-7d' +
  '&fields[include][]=title&fields[include][]=country' +
  '&fields[include][]=date&fields[include][]=theme' +
  '&fields[include][]=source&fields[include][]=url' +
  '&limit=30&sort[]=date.created:desc'

const CRON_SECRET = process.env.CRON_SECRET

// ---------- Mapping type ReliefWeb disaster → event_type interne ----------

const DISASTER_TYPE_MAP: Record<string, string> = {
  'armed-conflict': 'CONFLICT',
  'epidemic': 'HEALTH',
  'flood': 'FL',
  'earthquake': 'EQ',
  'volcano': 'VO',
  'storm': 'TC',
  'drought': 'DR',
  'fire': 'WF',
  'technological-disaster': 'CHEMICAL',
}

// ---------- Sévérité par type ----------

const SEVERITY_MAP: Record<string, number> = {
  'armed-conflict': 4,
  'epidemic': 3,
  'flood': 3,
  'earthquake': 3,
  'volcano': 3,
  'storm': 3,
  'drought': 2,
  'fire': 3,
  'technological-disaster': 3,
}

// ---------- Rayon d'impact estimé par event_type (km) ----------

function estimateRadius(eventType: string): number {
  const base: Record<string, number> = {
    CONFLICT: 500,
    HEALTH: 300,
    FL: 100,
    EQ: 150,
    VO: 50,
    TC: 300,
    DR: 200,
    WF: 75,
    CHEMICAL: 50,
  }
  return base[eventType] ?? 150
}

// ---------- Coordonnées approximatives par pays (capitale) ----------

const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Ukraine': [50.45, 30.52],
  'Iran (Islamic Republic of)': [35.69, 51.39],
  'Iran': [35.69, 51.39],
  'Syrian Arab Republic': [33.51, 36.29],
  'Syria': [33.51, 36.29],
  'Iraq': [33.31, 44.37],
  'Afghanistan': [34.53, 69.17],
  'Yemen': [15.37, 44.19],
  'Sudan': [15.59, 32.53],
  'South Sudan': [4.85, 31.60],
  'Ethiopia': [9.02, 38.75],
  'Somalia': [2.05, 45.32],
  'Democratic Republic of the Congo': [-4.32, 15.31],
  'Congo': [-4.32, 15.31],
  'Nigeria': [9.06, 7.49],
  'Myanmar': [19.76, 96.07],
  'Palestine': [31.90, 35.20],
  'Israel': [31.77, 35.23],
  'Russian Federation': [55.75, 37.62],
  'Russia': [55.75, 37.62],
  'Lebanon': [33.89, 35.50],
  'Pakistan': [33.69, 73.04],
  'Colombia': [4.71, -74.07],
  'Mexico': [19.43, -99.13],
  'Libya': [32.90, 13.18],
  'Mali': [12.64, -8.00],
  'Burkina Faso': [12.37, -1.52],
  'Niger': [13.51, 2.11],
  'Chad': [12.13, 15.05],
  'Cameroon': [3.87, 11.52],
  'Mozambique': [-25.97, 32.57],
  'Central African Republic': [4.36, 18.56],
  // --- supplémentaires ---
  'Haiti': [18.54, -72.34],
  'India': [28.61, 77.21],
  'Bangladesh': [23.81, 90.41],
  'Indonesia': [-6.21, 106.85],
  'Philippines': [14.60, 120.98],
  'China': [39.90, 116.40],
  'Japan': [35.68, 139.69],
  'Türkiye': [39.93, 32.85],
  'Turkey': [39.93, 32.85],
  'France': [48.86, 2.35],
  'United States of America': [38.90, -77.04],
  'Venezuela (Bolivarian Republic of)': [10.49, -66.88],
}

// ---------- Interfaces ----------

interface RWDisasterItem {
  id: string
  fields: {
    name?: string
    type?: { name: string; code: string }[]
    country?: { name: string; iso3?: string }[]
    date?: { created?: string; event?: string }
    glide?: string
    status?: string
    url?: string
  }
}

interface RWReportItem {
  id: string
  fields: {
    title?: string
    country?: { name: string; iso3?: string }[]
    date?: { created?: string; original?: string }
    theme?: { name: string }[]
    source?: { name: string }[]
    url?: string
  }
}

// ---------- Helpers ----------

function resolveCountryCoords(
  countries: { name: string }[] | undefined
): { lat: number; lon: number; countryName: string } | null {
  if (!countries || countries.length === 0) return null
  for (const c of countries) {
    const coords = COUNTRY_COORDS[c.name]
    if (coords) return { lat: coords[0], lon: coords[1], countryName: c.name }
  }
  return null
}

// ---------- Route Handler ----------

export async function GET(request: Request) {
  // 1. Vérifier le secret du cron
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Client Supabase service_role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const runAt = new Date().toISOString()
  let articlesProcessed = 0
  let alertsCreated = 0
  let errorMessage: string | null = null

  try {
    // 3. Fetch en parallèle : disasters + reports
    const [disastersRes, reportsRes] = await Promise.all([
      fetch(DISASTERS_URL, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }),
      fetch(REPORTS_URL, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }),
    ])

    if (!disastersRes.ok) {
      throw new Error(`ReliefWeb Disasters API error: ${disastersRes.status}`)
    }
    if (!reportsRes.ok) {
      throw new Error(`ReliefWeb Reports API error: ${reportsRes.status}`)
    }

    const disastersJson = await disastersRes.json()
    const reportsJson = await reportsRes.json()

    const disasters: RWDisasterItem[] = disastersJson.data ?? []
    const reports: RWReportItem[] = reportsJson.data ?? []

    articlesProcessed = disasters.length + reports.length

    // Collecter tous les IDs pour dedup en une seule requête
    const allRwIds = [
      ...disasters.map((d) => String(d.id)),
      ...reports.map((r) => `report-${r.id}`),
    ]

    if (allRwIds.length === 0) {
      await supabase.from('source_ingestion_logs').insert({
        source: 'RELIEFWEB',
        run_at: runAt,
        status: 'success',
        articles_processed: 0,
        alerts_created: 0,
        error_message: null,
      })
      return NextResponse.json({ ok: true, articlesProcessed: 0, alertsCreated: 0 })
    }

    // 6. Dedup : récupérer les reliefweb_id déjà en BDD
    const { data: existing } = await supabase
      .from('alerts')
      .select('raw_data')
      .eq('source', 'RELIEFWEB')
      .in('raw_data->>reliefweb_id', allRwIds)

    const existingIds = new Set(
      (existing ?? []).map(
        (a: { raw_data: { reliefweb_id: string } }) => String(a.raw_data.reliefweb_id)
      )
    )

    const newAlerts: Record<string, unknown>[] = []

    // --- Traiter les disasters ---
    for (const disaster of disasters) {
      const rwId = String(disaster.id)
      if (existingIds.has(rwId)) continue

      const f = disaster.fields
      const typeCode = f.type?.[0]?.code ?? 'armed-conflict'
      const eventType = DISASTER_TYPE_MAP[typeCode] ?? 'CONFLICT'

      const location = resolveCountryCoords(f.country)
      if (!location) continue // skip si pas de coordonnées

      const severity = SEVERITY_MAP[typeCode] ?? 2

      newAlerts.push({
        source: 'RELIEFWEB',
        event_type: eventType,
        title: f.name ?? 'Crise ReliefWeb',
        description: f.country?.map((c) => c.name).join(', ') ?? null,
        latitude: location.lat,
        longitude: location.lon,
        radius_km: estimateRadius(eventType),
        severity,
        score_fiabilite: 85,
        raw_data: {
          reliefweb_id: rwId,
          type_code: typeCode,
          type_name: f.type?.[0]?.name ?? null,
          status: f.status ?? null,
          glide: f.glide ?? null,
          url: f.url ?? null,
          countries: f.country?.map((c) => c.name) ?? [],
          date_created: f.date?.created ?? null,
          item_kind: 'disaster',
        },
        is_active: true,
      })
    }

    // --- Traiter les reports ---
    for (const report of reports) {
      const rwId = `report-${report.id}`
      if (existingIds.has(rwId)) continue

      const f = report.fields

      const location = resolveCountryCoords(f.country)
      if (!location) continue

      newAlerts.push({
        source: 'RELIEFWEB',
        event_type: 'CONFLICT',
        title: f.title ?? 'Rapport conflit armé',
        description: [
          f.country?.map((c) => c.name).join(', '),
          f.source?.map((s) => s.name).join(', '),
        ]
          .filter(Boolean)
          .join(' — ') || null,
        latitude: location.lat,
        longitude: location.lon,
        radius_km: estimateRadius('CONFLICT'),
        severity: 4,
        score_fiabilite: 85,
        raw_data: {
          reliefweb_id: rwId,
          themes: f.theme?.map((t) => t.name) ?? [],
          sources: f.source?.map((s) => s.name) ?? [],
          url: f.url ?? null,
          countries: f.country?.map((c) => c.name) ?? [],
          date_created: f.date?.created ?? null,
          item_kind: 'report',
        },
        is_active: true,
      })
    }

    // 10. Batch insert
    if (newAlerts.length > 0) {
      const { error } = await supabase.from('alerts').insert(newAlerts)
      if (error) throw new Error(`Supabase insert error: ${error.message}`)
      alertsCreated = newAlerts.length
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[ingest-reliefweb]', errorMessage)
  }

  // 10. Log d'ingestion
  await supabase.from('source_ingestion_logs').insert({
    source: 'RELIEFWEB',
    run_at: runAt,
    status: errorMessage ? (alertsCreated > 0 ? 'partial' : 'error') : 'success',
    articles_processed: articlesProcessed,
    alerts_created: alertsCreated,
    error_message: errorMessage,
  })

  // 11. Retourner le résumé JSON
  return NextResponse.json({
    ok: !errorMessage,
    source: 'RELIEFWEB',
    articlesProcessed,
    disastersFetched: articlesProcessed,
    alertsCreated,
    error: errorMessage,
  })
}
