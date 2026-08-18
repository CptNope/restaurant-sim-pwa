// Bump this version on any release where the offline-fallback shell (this
// file's ASSETS list) needs to change. The fetch handler below is
// network-first, so ordinary app updates propagate without a version bump.
const CACHE_NAME = 'chefai-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest version. Only fall back to
// the cache when the network is unavailable (offline), so a stale cached
// index.html can never shadow a fresh deploy. Successful responses refresh
// the cache as they come in, keeping the offline fallback reasonably current.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request).then((res) => res || caches.match('./index.html')))
  );
});
