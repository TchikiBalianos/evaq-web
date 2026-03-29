// Service Worker EVAQ
// Gère les notifications push et le cache offline de base

const CACHE_NAME = 'evaq-v2'
const TILE_CACHE = 'evaq-tiles-v1'
const OFFLINE_URL = '/offline'
const MAX_TILE_CACHE = 500 // Limiter à 500 tuiles (~50 MB)

// Installation : mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_URL, '/', '/alertes', '/plan-fuite', '/kit'])
    )
  )
  self.skipWaiting()
})

// Activation : nettoyage des anciens caches (garder TILE_CACHE)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
  )
  self.clients.claim()
})

// Fetch : strategy network-first avec fallback cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Navigation : network-first → offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Tuiles carte : cache-first (stale-while-revalidate)
  if (url.hostname.includes('openfreemap.org') || url.hostname.includes('tile') || url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((res) => {
            if (res.ok) {
              const clone = res.clone()
              // Vérifier la taille du cache et élaguer si nécessaire
              cache.put(event.request, clone).then(() => trimTileCache(cache))
            }
            return res
          }).catch(() => cached)

          return cached || fetchPromise
        })
      )
    )
    return
  }

  // API calls : network-first avec cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok && event.request.method === 'GET') {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone))
          }
          return res
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Assets statiques : cache-first
  if (event.request.destination === 'image' || event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone))
          return res
        })
      )
    )
  }
})

// Élaguer le cache de tuiles si trop gros
async function trimTileCache(cache) {
  const keys = await cache.keys()
  if (keys.length > MAX_TILE_CACHE) {
    // Supprimer les plus anciennes (FIFO)
    const toDelete = keys.slice(0, keys.length - MAX_TILE_CACHE)
    await Promise.all(toDelete.map((k) => cache.delete(k)))
  }
}

// Push : réception d'une notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, icon, badge, tag, url, defcon } = data

  // Couleur de vibration selon niveau DEFCON
  const vibrate =
    defcon === 1 ? [200, 100, 200, 100, 200] :
    defcon === 2 ? [200, 100, 200] :
    defcon === 3 ? [100, 50, 100] :
    [100]

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    vibrate,
    tag: tag || `evaq-defcon-${defcon}`,
    renotify: true,
    requireInteraction: defcon <= 2,
    data: { url: url || '/', defcon },
    actions: [
      { action: 'open', title: 'Voir le plan' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
