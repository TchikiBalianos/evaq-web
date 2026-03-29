'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

function initVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) throw new Error('Missing VAPID keys')
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
    publicKey,
    privateKey
  )
}

export async function subscribeUser(subscription: PushSubscription) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('users')
    .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
    .eq('id', user.id)

  if (error) throw new Error('Erreur sauvegarde subscription')
  return { success: true }
}

export async function unsubscribeUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  await supabase
    .from('users')
    .update({ push_subscription: null })
    .eq('id', user.id)

  return { success: true }
}

// Utilisé uniquement en dev pour tester les notifications
export async function sendTestNotification(message: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Test notifications désactivées en production')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data } = await supabase
    .from('users')
    .select('push_subscription')
    .eq('id', user.id)
    .single()

  if (!data?.push_subscription) {
    throw new Error('Pas de subscription push enregistrée')
  }

  initVapid()
  await webpush.sendNotification(
    data.push_subscription as webpush.PushSubscription,
    JSON.stringify({
      title: 'EVAQ — Test',
      body: message,
      icon: '/icons/icon-192x192.png',
      defcon: 5,
    })
  )

  return { success: true }
}
