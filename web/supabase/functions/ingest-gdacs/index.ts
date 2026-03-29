// Edge Function : ingest-gdacs
// Récupère les alertes GDACS (catastrophes naturelles ONU/UE) et les stocke en BDD.
// Déclenchée toutes les 5 minutes via pg_cron ou Supabase Scheduled Functions.
//
// API GDACS : https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH
// Citer la source dans les alertes créées : "GDACS (UN/EU)"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GDACS_API =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH' +
  '?eventlist=EQ,FL,TC,VO,DR,WF&alertlevel=Green,Orange,Red'

// Score de fiabilité GDACS selon le niveau d'alerte
const ALERT_SCORE: Record<string, number> = {
  Red: 90,
  Orange: 75,
  Green: 55,
}

// Sévérité GDACS → score interne (1-5)
const ALERT_SEVERITY: Record<string, number> = {
  Red: 4,
  Orange: 3,
  Green: 2,
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const runAt = new Date().toISOString()
  let articlesProcessed = 0
  let alertsCreated = 0
  let errorMessage: string | null = null

  try {
    const response = await fetch(GDACS_API, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`GDACS API error: ${response.status}`)
    }

    const data = await response.json()
    const events: GDACSEvent[] = data.features ?? []
    articlesProcessed = events.length

    for (const event of events) {
      const props = event.properties
      const [lng, lat] = event.geometry.coordinates

      // Éviter les doublons : vérifier si l'alerte existe déjà (même source + eventid)
      const eventId = String(props.eventid)
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('source', 'GDACS')
        .eq('raw_data->>eventid', eventId)
        .maybeSingle()

      if (existing) continue

      const alertLevel = String(props.alertlevel ?? 'Green')
      const eventType = String(props.eventtype ?? 'EQ')

      const { error } = await supabase.from('alerts').insert({
        source: 'GDACS',
        event_type: eventType,
        title: String(props.name ?? props.htmlname ?? 'Événement GDACS'),
        description: props.description ? String(props.description) : null,
        latitude: lat,
        longitude: lng,
        radius_km: estimateRadius(eventType, alertLevel),
        severity: ALERT_SEVERITY[alertLevel] ?? 2,
        score_fiabilite: ALERT_SCORE[alertLevel] ?? 55,
        raw_data: { eventid: eventId, ...props },
      })

      if (!error) alertsCreated++
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

  return new Response(
    JSON.stringify({ articlesProcessed, alertsCreated, error: errorMessage }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

function estimateRadius(eventType: string, alertLevel: string): number {
  const base: Record<string, number> = {
    EQ: 150, FL: 100, TC: 300, VO: 50, DR: 200, WF: 75,
  }
  const multiplier: Record<string, number> = { Red: 1.5, Orange: 1.2, Green: 1 }
  return (base[eventType] ?? 100) * (multiplier[alertLevel] ?? 1)
}

interface GDACSEvent {
  properties: Record<string, unknown>
  geometry: { coordinates: [number, number] }
}
