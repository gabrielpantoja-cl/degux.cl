const CACHE_NAME = 'referenciales-cache-v1';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/referenciales')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            await cache.put(event.request, clonedResponse);
          }
          return networkResponse;
        } catch {
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || new Response('No hay datos disponibles', {
            status: 404,
            statusText: 'Not Found'
          });
        }
      })()
    );
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/api/referenciales'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});