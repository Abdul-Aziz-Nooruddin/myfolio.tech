/**
 * MyFolio Service Worker
 * Provides Cache-First for static assets and Network-First with offline fallback for HTML pages.
 */

const CACHE_NAME = 'myfolio-cache-v3';
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

  // Never intercept localhost or 127.0.0.1 requests — always direct to network
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // Never intercept iframe embeds or live template preview routes
  if (
    req.destination === 'iframe' ||
    url.searchParams.has('embed') ||
    url.pathname.startsWith('/p/') ||
    ['/jack-3d', '/nadia', '/kage', '/rbp', '/tom', '/apogee'].includes(url.pathname)
  ) {
    return;
  }

  // 1. Static Assets (CSS, JS, Images, Fonts) -> Cache-First with background revalidation
  if (/\.(css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          fetch(req).then((netRes) => {
            if (netRes.ok) {
              const clone = netRes.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, clone));
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

  // 2. HTML Navigation Pages -> Network-First with Cache Fallback for offline support (NEVER hijack with /dashboard)
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
          return caches.match('/') || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        });
      })
    );
  }
});
