// Service Worker for MatchMind AI PWA
const CACHE_NAME = 'matchmind-ai-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened');
            return cache.addAll(urlsToCache).catch(err => {
                console.log('Cache add error:', err);
                // Don't fail installation if cache fails
            });
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first for API calls, Cache first for assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // API requests - Network first with cache fallback
    if (url.hostname === 'v3.football.api-sports.io') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Don't cache API responses - they're handled by app.js cache logic
                    return response;
                })
                .catch(err => {
                    console.log('API fetch failed:', err);
                    // Return offline message
                    return new Response(
                        JSON.stringify({ 
                            error: 'Offline - No cached data available',
                            offline: true
                        }),
                        {
                            headers: { 'Content-Type': 'application/json' },
                            status: 503
                        }
                    );
                })
        );
        return;
    }

    // Static assets - Cache first, Network fallback
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    // Don't cache dynamic content
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    // Clone the response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                });
            })
            .catch(() => {
                // Return offline page
                return caches.match('/index.html');
            })
    );
});

// Background sync for offline support
self.addEventListener('sync', event => {
    if (event.tag === 'sync-matches') {
        event.waitUntil(syncMatches());
    }
});

async function syncMatches() {
    try {
        console.log('Background sync: Syncing matches');
        // Logic to sync matches when connection is restored
    } catch (error) {
        console.log('Background sync error:', error);
    }
}

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;

    const options = {
        body: event.data.text(),
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%230a0e27" width="192" height="192"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="120" font-weight="bold" fill="%2300d4ff" font-family="Arial">M</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%2300d4ff" width="96" height="96"/></svg>',
        tag: 'matchmind-ai-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('MatchMind AI', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Check if there's already a window open
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Periodic background sync
self.addEventListener('periodicsync', event => {
    if (event.tag === 'matchmind-sync') {
        event.waitUntil(periodicSync());
    }
});

async function periodicSync() {
    try {
        console.log('Periodic sync: Checking for updates');
        // Logic for periodic syncing
    } catch (error) {
        console.log('Periodic sync error:', error);
    }
}

console.log('Service Worker loaded');
