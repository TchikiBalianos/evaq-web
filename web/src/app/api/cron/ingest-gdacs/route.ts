import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GDACS_API =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH' +
  '?eventlist=EQ,FL,TC,VO,DR,WF&alertlevel=Green,Orange,Red'

const CRON_SECRET = process.env.CRON_SECRET

// Score de fiabilite GDACS selon le niveau d'alerte
const ALERT_SCORE: Record<string, number> = {
  Red: 90,
  Orange: 75,
  Green: 55,
}

// Severite GDACS → score interne (1-5)
const ALERT_SEVERITY: Record<string, number> = {
  Red: 4,
  Orange: 3,
  Green: 2,
}

// Rayon d'impact estime par type d'evenement (km)
function estimateRadius(eventType: string, alertLevel: string): number {
  const base: Record<string, number> = {
    EQ: 150, FL: 100, TC: 300, VO: 50, DR: 200, WF: 75,
  }
  const multiplier: Record<string, number> = { Red: 1.5, Orange: 1.2, Green: 1 }
  return (base[eventType] ?? 100) * (multiplier[alertLevel] ?? 1)
}

// Mapping eventtype GDACS → event_type interne
function mapEventType(gdacsType: string): string {
  const map: Record<string, string> = {
    EQ: 'EQ', FL: 'FL', TC: 'TC', VO: 'VO', DR: 'DR', WF: 'WF',
  }
  return map[gdacsType] ?? 'EQ'
}

interface GDACSFeature {
  properties: Record<string, unknown>
  geometry: { coordinates: [number, number] }
}

export async function GET(request: Request) {
  // Securite : verifier le secret du cron
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    )
  }

  // Client service_role pour bypasser RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const runAt = new Date().toISOString()
  let articlesProcessed = 0
  let alertsCreated = 0
  let errorMessage: string | null = null

  try {
    const response = await fetch(GDACS_API, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`GDACS API error: ${response.status}`)
    }

    const data = await response.json()
    const features: GDACSFeature[] = data.features ?? []
    articlesProcessed = features.length

    if (features.length === 0) {
      throw new Error('No features returned from GDACS API')
    }

    // Recuperer les eventids existants en une seule requete (batch dedup)
    const eventIds = features.map((f) => String(f.properties.eventid))
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('raw_data')
      .eq('source', 'GDACS')
      .in('raw_data->>eventid', eventIds)

    const existingIds = new Set(
      (existingAlerts ?? []).map((a: { raw_data: { eventid: string } }) =>
        String(a.raw_data.eventid)
      )
    )

    // Preparer les insertions en batch
    const newAlerts = []

    for (const feature of features) {
      const props = feature.properties
      const eventId = String(props.eventid)

      if (existingIds.has(eventId)) continue

      const [lng, lat] = feature.geometry.coordinates
      const alertLevel = String(props.alertlevel ?? 'Green')
      const eventType = String(props.eventtype ?? 'EQ')

      newAlerts.push({
        source: 'GDACS',
        event_type: mapEventType(eventType),
        title: String(props.name ?? props.htmlname ?? 'Evenement GDACS'),
        description: props.description ? String(props.description) : null,
        latitude: lat,
        longitude: lng,
        radius_km: estimateRadius(eventType, alertLevel),
        severity: ALERT_SEVERITY[alertLevel] ?? 2,
        score_fiabilite: ALERT_SCORE[alertLevel] ?? 55,
        raw_data: { eventid: eventId, alertlevel: alertLevel, eventtype: eventType, ...props },
        is_active: true,
      })
    }

    // Insert batch
    if (newAlerts.length > 0) {
      const { error } = await supabase
        .from('alerts')
        .insert(newAlerts)

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`)
      }

      alertsCreated = newAlerts.length
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[ingest-gdacs]', errorMessage)
  }

  // Logger le run
  await supabase.from('source_ingestion_logs').insert({
    source: 'GDACS',
    run_at: runAt,
    status: errorMessage ? (alertsCreated > 0 ? 'partial' : 'error') : 'success',
    articles_processed: articlesProcessed,
    alerts_created: alertsCreated,
    error_message: errorMessage,
  })

  return NextResponse.json({
    ok: !errorMessage,
    articlesProcessed,
    alertsCreated,
    error: errorMessage,
  })
}
