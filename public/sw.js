// LifeOS service worker (F8, doc 07 §8) — push display + click-through only.
// No fetch caching in v1: the app is online-first; the SW exists so the
// evening-reminder Edge Function's Web Push has something to land on.
self.addEventListener('push', (e) => {
  const d = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(d.title ?? 'LifeOS', {
      body: d.body ?? 'Close out your day',
      icon: '/icons/192.png',
      badge: '/icons/192.png',
      data: d.url ?? '/capture',
    }),
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.openWindow(e.notification.data || '/capture'))
})
