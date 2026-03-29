import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const CRON_SECRET = process.env.CRON_SECRET

const DEFCON_LABELS: Record<number, string> = {
  1: 'URGENCE',
  2: 'DANGER',
  3: 'ALERTE',
  4: 'ATTENTION',
}

function initVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
    publicKey,
    privateKey
  )
  return true
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  if (!initVapid()) {
    return NextResponse.json({ error: 'Missing VAPID keys' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Alertes severes des dernieres 24h non encore notifiees
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: severeAlerts, error: alertErr } = await supabase
    .from('alerts')
    .select('id, title, event_type, severity, latitude, longitude, radius_km')
    .eq('is_active', true)
    .gte('severity', 3)
    .gte('created_at', since)
    .order('severity', { ascending: false })
    .limit(10)

  if (alertErr || !severeAlerts || severeAlerts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no severe alerts' })
  }

  // Utilisateurs avec push_subscription active et seuil DEFCON <= 3
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, push_subscription, defcon_threshold')
    .not('push_subscription', 'is', null)
    .lte('defcon_threshold', 3)

  if (userErr || !users || users.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no subscribers' })
  }

  let sent = 0
  let failed = 0

  // Pour chaque alerte severe, notifier les users
  // (MVP simple : on envoie la plus severe a tous les abonnes)
  const topAlert = severeAlerts[0]
  const defconLevel = topAlert.severity >= 4 ? 2 : 3
  const label = DEFCON_LABELS[defconLevel] ?? 'ALERTE'

  const payload = JSON.stringify({
    title: `EVAQ ${label} — DEFCON ${defconLevel}`,
    body: topAlert.title,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    defcon: defconLevel,
    url: '/alertes',
    tag: `evaq-alert-${topAlert.id}`,
  })

  for (const user of users) {
    try {
      await webpush.sendNotification(
        user.push_subscription as webpush.PushSubscription,
        payload
      )
      sent++

      // Logger dans user_alerts
      await supabase.from('user_alerts').upsert(
        {
          user_id: user.id,
          alert_id: topAlert.id,
          defcon_level: defconLevel,
          notified_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,alert_id' }
      )
    } catch (err) {
      failed++
      // Si subscription invalide (410 Gone), la supprimer
      if (err instanceof webpush.WebPushError && err.statusCode === 410) {
        await supabase
          .from('users')
          .update({ push_subscription: null })
          .eq('id', user.id)
      }
    }
  }

  return NextResponse.json({ ok: true, sent, failed, alertId: topAlert.id })
}
