const CACHE_NAME = 'sudoku-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Pre-cache the app shell on install. Each file is cached individually so
// one bad/missing file doesn't block the whole cache from being created.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.log('Failed to cache', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Clear out old caches and take control immediately, so an update to the
// app doesn't require closing and reopening it first.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Serve from cache instantly, but also refresh the cache in the
        // background if we're online so the next launch has the latest copy.
        fetch(event.request).then((fresh) => {
          if (fresh.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, fresh));
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline and not cached: for page loads, fall back to the app shell
        // so the game still opens instead of showing a browser error.
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
