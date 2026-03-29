// Edge Function : calc-defcon
// Calcule le niveau DEFCON d'un utilisateur donné selon :
//   - les alertes actives dans Supabase
//   - la position H3 de l'utilisateur (résolution 7)
//   - les seuils configurés par l'utilisateur
//
// NOTE : la conversion H3 → distance réelle se fait ici côté serveur,
// à partir de l'index H3 stocké (pas de coordonnées exactes).
//
// Appelée :
//   - après chaque run d'ingest (pour notifier les utilisateurs impactés)
//   - à la demande depuis le client (pull to refresh)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Distance approximative au centre d'un hexagone H3 résolution 7 (~5km²)
// Utilisée pour comparer avec le rayon d'une alerte
// En production : importer la lib H3 pour une précision exacte
const H3_RES7_RADIUS_KM = 2.5

interface DefconRequest {
  user_id?: string // si absent : calculer pour tous les users actifs
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body: DefconRequest = await req.json().catch(() => ({}))

  // Récupérer les utilisateurs à traiter
  let usersQuery = supabase
    .from('users')
    .select('id, defcon_threshold, alert_mode, push_subscription, user_profiles(h3_index)')

  if (body.user_id) {
    usersQuery = usersQuery.eq('id', body.user_id)
  } else {
    // Limiter aux users actifs dans les 7 derniers jours
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    usersQuery = usersQuery.gte('last_active_at', since)
  }

  const { data: users, error: usersErr } = await usersQuery
  if (usersErr || !users) {
    return new Response(JSON.stringify({ error: usersErr?.message }), { status: 500 })
  }

  // Récupérer les alertes actives
  const { data: alerts } = await supabase
    .from('alerts')
    .select('id, latitude, longitude, radius_km, severity, score_fiabilite, event_type')
    .eq('is_active', true)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const notifications: Array<{ userId: string; defcon: number; alertId: string }> = []

  for (const user of users) {
    const profile = Array.isArray(user.user_profiles)
      ? user.user_profiles[0]
      : user.user_profiles

    if (!profile?.h3_index || !alerts?.length) {
      // Pas de position configurée → DEFCON 5 par défaut
      continue
    }

    // Approximation : centroïde H3 (à remplacer par h3-js en production)
    const userCoords = h3ToApproxCoords(profile.h3_index)
    if (!userCoords) continue

    let maxDefcon = 5

    for (const alert of alerts) {
      // Score sage : ignorer les alertes < 80% en mode sage
      const sageThreshold = user.alert_mode === 'sage' ? 80 : 50
      if (alert.score_fiabilite < sageThreshold) continue

      const dist = haversineKm(
        userCoords.lat, userCoords.lng,
        alert.latitude, alert.longitude
      )

      if (dist <= alert.radius_km + H3_RES7_RADIUS_KM) {
        const defcon = calcDefconLevel(dist, alert.radius_km, alert.severity)
        if (defcon < maxDefcon) {
          maxDefcon = defcon
          if (defcon <= user.defcon_threshold && user.push_subscription) {
            notifications.push({ userId: user.id, defcon, alertId: alert.id })
          }
        }
      }
    }

    // Mettre à jour user_alerts
    if (maxDefcon < 5 && alerts.length > 0) {
      await supabase.from('user_alerts').upsert({
        user_id: user.id,
        alert_id: alerts[0].id, // TODO : gérer plusieurs alertes
        defcon_level: maxDefcon,
      }, { onConflict: 'user_id,alert_id' })
    }
  }

  return new Response(
    JSON.stringify({ usersProcessed: users.length, notificationsPending: notifications.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

function calcDefconLevel(distKm: number, radiusKm: number, severity: number): number {
  const ratio = distKm / radiusKm
  if (ratio <= 0.2) return Math.max(1, 4 - severity)
  if (ratio <= 0.5) return Math.min(4, 4 - severity + 1)
  if (ratio <= 1.0) return Math.min(5, 5 - severity + 2)
  return 4
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Approximation grossière : dériver lat/lng d'un index H3 res7
// REMPLACER par h3-js en production pour la précision
function h3ToApproxCoords(h3Index: string): { lat: number; lng: number } | null {
  if (!h3Index || h3Index.length < 10) return null
  // Placeholder — retourne null pour l'instant
  // En production : import { cellToLatLng } from 'https://esm.sh/h3-js@4'
  return null
}
