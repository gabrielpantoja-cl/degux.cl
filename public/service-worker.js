const CACHE_NAME = 'referenciales-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Agrega aquí otros recursos estáticos como imágenes, CSS, etc.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Error durante la instalación del cache:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/referenciales')) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          // Intentar primero la red
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            await cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
          throw new Error('Network response was not ok');
        } catch (error) {
          console.log('Error fetching data, falling back to cache:', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(JSON.stringify({ error: 'No hay datos disponibles' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })()
    );
  }
  // Para otras rutas, usar estrategia network-first
  return event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
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