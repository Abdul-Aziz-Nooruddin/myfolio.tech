/**
 * MyFolio Service Worker — Cache Eviction & Cleanup Engine
 * Safely unregisters obsolete service worker instances and purges stale caches
 * to ensure users always receive fresh, authoritative assets and styles without FOUC or zombie cache.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass-through: never intercept or block network requests
self.addEventListener('fetch', () => {
  // Let the browser handle all requests directly via the standard HTTP network stack
});
