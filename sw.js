// Fence Coach Service Worker
// Bump this version string whenever you push an update —
// the browser will detect the change and refresh the cache automatically.
const VERSION  = 'fence-coach-v2-001';
const CACHE    = `cache-${VERSION}`;

const ASSETS = [
  '/fence-coach/fence-coach-v2.html',
  '/fence-coach/sw.js',
];

// ── Install: cache all assets ────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ──────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network first, fall back to cache ─────────────────────
// Network-first means you always get the latest version when online.
// Cache kicks in only if the network fails (offline mode).
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and store fresh copy in cache
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
