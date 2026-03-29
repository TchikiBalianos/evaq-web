'use client'

import { useEffect, useState } from 'react'
import { subscribeUser, unsubscribeUser } from '@/app/actions/push'
import { useI18n } from '@/lib/i18n'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function PushSubscribe() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      void Promise.resolve().then(() => setLoading(false))
      return
    }

    void Promise.resolve().then(() => setSupported(true))

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
      setLoading(false)
    })
  }, [])

  async function handleToggle() {
    setLoading(true)
    setError(null)

    try {
      const reg = await navigator.serviceWorker.ready

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
        await unsubscribeUser()
        setSubscribed(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setError(t('push.denied'))
          setLoading(false)
          return
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        await subscribeUser(sub)
        setSubscribed(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }

    setLoading(false)
  }

  if (!supported) return null

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{t('push.title')}</p>
        <p className="text-xs text-muted">
          {subscribed ? t('push.active') : t('push.inactive')}
        </p>
        {error && <p className="text-xs text-defcon-2 mt-1">{error}</p>}
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          subscribed
            ? 'bg-surface text-muted hover:bg-border'
            : 'bg-defcon-5 text-white hover:opacity-90'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? '...' : subscribed ? t('push.disable') : t('push.enable')}
      </button>
    </div>
  )
}
