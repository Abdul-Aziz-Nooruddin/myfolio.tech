/**
 * MyFolio Service Worker
 * Provides Cache-First for static assets and Network-First with offline fallback for HTML pages.
 */

const CACHE_NAME = 'myfolio-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/app-tokens.css',
  '/style.css',
  '/button-system.css',
  '/theme-toggle.js',
  '/sidebar.js',
  '/turbo-nav.js',
  '/cookie-banner.js',
  '/analytics.js',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and API requests
  if (req.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // 1. Static Assets (CSS, JS, Images, Fonts) -> Cache-First with background revalidation
  if (/\.(css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(req).then((netRes) => {
            if (netRes.ok) {
              caches.open(CACHE_NAME).then((c) => c.put(req, netRes));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((netRes) => {
          if (netRes.ok) {
            const clone = netRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return netRes;
        });
      })
    );
    return;
  }

  // 2. HTML Navigation Pages -> Network-First with Cache Fallback for instant speed & offline support
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((netRes) => {
        if (netRes.ok) {
          const clone = netRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return netRes;
      }).catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          return caches.match('/dashboard') || caches.match('/');
        });
      })
    );
  }
});
