import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

/**
 * Cron job : vérifie les items du kit qui expirent dans les 7 prochains jours
 * et envoie une notification push aux utilisateurs concernés.
 * Planifié : 1x/jour à 8h UTC via Vercel Cron.
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Configure web-push
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'Missing VAPID keys' }, { status: 500 })
  }
  webpush.setVapidDetails(
    'mailto:contact@evaq.app',
    vapidPublic,
    vapidPrivate
  )

  // Find items expiring within 7 days
  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { data: expiringItems } = await supabase
    .from('inventory_items')
    .select('user_id, title, expiry_date')
    .gte('expiry_date', now.toISOString().split('T')[0])
    .lte('expiry_date', in7days.toISOString().split('T')[0])

  if (!expiringItems || expiringItems.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Group by user
  const byUser = new Map<string, string[]>()
  for (const item of expiringItems) {
    const list = byUser.get(item.user_id) ?? []
    list.push(item.title)
    byUser.set(item.user_id, list)
  }

  let sent = 0

  for (const [userId, titles] of byUser) {
    // Get user push subscription
    const { data: user } = await supabase
      .from('users')
      .select('push_subscription')
      .eq('id', userId)
      .single()

    if (!user?.push_subscription) continue

    const body = titles.length === 1
      ? `"${titles[0]}" expire bientot. Pensez a le renouveler.`
      : `${titles.length} items de votre kit expirent bientot.`

    try {
      await webpush.sendNotification(
        user.push_subscription as webpush.PushSubscription,
        JSON.stringify({
          title: 'EVAQ — Kit de survie',
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'kit-expiry',
          url: '/kit',
          defcon: 5,
        })
      )
      sent++
    } catch {
      // Subscription may be invalid — skip
    }
  }

  return NextResponse.json({ sent, users: byUser.size, items: expiringItems.length })
}
