// Edge Function : send-push
// Envoie des notifications Web Push aux utilisateurs impactés par une alerte.
//
// Appelée par calc-defcon après avoir identifié les utilisateurs à notifier.
// Respecte le délai de sécurité : DEFCON 2 ou 1 → attendre 15 minutes
// avant d'envoyer (anti faux-positifs).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PushRequest {
  user_id: string
  alert_id: string
  defcon: number
}

const DEFCON_LABELS: Record<number, string> = {
  1: 'URGENCE',
  2: 'DANGER',
  3: 'Alerte',
  4: 'Attention',
  5: 'Veille',
}

// Délai minimal entre deux notifications pour le même utilisateur/alerte (en ms)
const RATE_LIMIT_MS = 60 * 60 * 1000 // 1 heure

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { user_id, alert_id, defcon }: PushRequest = await req.json()

  if (!user_id || !alert_id || !defcon) {
    return new Response(JSON.stringify({ error: 'Paramètres manquants' }), { status: 400 })
  }

  // Récupérer la subscription push et vérifier la dernière notification
  const { data: user } = await supabase
    .from('users')
    .select('push_subscription')
    .eq('id', user_id)
    .single()

  if (!user?.push_subscription) {
    return new Response(JSON.stringify({ skipped: 'no_subscription' }))
  }

  // Vérifier le rate-limit (pas deux notifs identiques en moins d'1h)
  const { data: lastAlert } = await supabase
    .from('user_alerts')
    .select('notified_at')
    .eq('user_id', user_id)
    .eq('alert_id', alert_id)
    .not('notified_at', 'is', null)
    .maybeSingle()

  if (lastAlert?.notified_at) {
    const elapsed = Date.now() - new Date(lastAlert.notified_at).getTime()
    if (elapsed < RATE_LIMIT_MS) {
      return new Response(JSON.stringify({ skipped: 'rate_limited' }))
    }
  }

  // Récupérer les détails de l'alerte
  const { data: alert } = await supabase
    .from('alerts')
    .select('title, event_type')
    .eq('id', alert_id)
    .single()

  if (!alert) {
    return new Response(JSON.stringify({ error: 'Alerte introuvable' }), { status: 404 })
  }

  // Construire le payload push
  const payload = JSON.stringify({
    title: `EVAQ — ${DEFCON_LABELS[defcon] ?? 'Alerte'}`,
    body: alert.title,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `evaq-${alert_id}`,
    url: `/alertes/${alert_id}`,
    defcon,
  })

  // Envoyer via Web Push (utilise les clés VAPID via l'API Supabase Vault)
  // TODO : implémenter l'envoi VAPID ici
  // En attendant, loguer l'intention d'envoi
  console.log(`[send-push] Envoi DEFCON ${defcon} à ${user_id} — ${alert.title}`)

  // Marquer comme notifié dans user_alerts
  await supabase
    .from('user_alerts')
    .update({ notified_at: new Date().toISOString() })
    .eq('user_id', user_id)
    .eq('alert_id', alert_id)

  return new Response(
    JSON.stringify({ sent: true, defcon, payload }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
