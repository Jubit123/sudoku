const CACHE_NAME = 'sudoku-v1';
const ASSETS = [
  '/sudokunijubit.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Try cache first, fall back to network. For navigation requests
  // (when the browser asks for a page) respond with the cached
  // app shell to avoid 404s when launching from homescreen.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        // If the request is a navigation request, serve the app shell
        if (event.request.mode === 'navigate') {
          return caches.match('/sudokunijubit.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
