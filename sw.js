const CACHE_NAME = 'matchmind-ai-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/api.js',
    '/analysis.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache).catch(() => {
                // Continue even if some files fail
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    // API requests - Network first
    if (url.hostname === 'v3.football.api-sports.io') {
        event.respondWith(
            fetch(request)
                .then(response => response)
                .catch(err => {
                    console.log('API offline:', err);
                    return new Response(
                        JSON.stringify({ error: 'Offline', offline: true }),
                        { headers: { 'Content-Type': 'application/json' }, status: 503 }
                    );
                })
        );
        return;
    }

    // Static assets - Cache first
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) return response;
                return fetch(request).then(response => {
                    if (!response || response.status !== 200) return response;
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                });
            })
            .catch(() => caches.match('/index.html'))
    );
});
