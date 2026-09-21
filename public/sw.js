// Service Worker minimal pour EtuDeals PWA
// Cache statique des assets clés pour un chargement rapide et un fallback offline basique.

const CACHE_NAME = 'etudeals-cache-v1'
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/static/css/theme.css',
  '/static/images/logo.png',
  '/static/images/icon-192.png',
  '/static/images/icon-512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ne jamais mettre en cache les appels API (données dynamiques)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Stratégie "stale-while-revalidate" pour les assets statiques
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            }
            return networkResponse
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
  }
})
