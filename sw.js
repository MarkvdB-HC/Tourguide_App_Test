const CACHE_NAME = 'dirk-geofence-v1';
// De lijst met bestanden die de app nodig heeft om offline te werken.
const urlsToCache = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/dirk-logo.png'
];

// Stap 1: Installatie - Cache de app shell
self.addEventListener('install', event => {
    console.log('Service Worker: Installatie...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Bestanden worden gecached');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Stap 2: Fetch - Onderschep netwerkverzoeken
self.addEventListener('fetch', event => {
    event.respondWith(
        // Kijk eerst of het gevraagde bestand in de cache zit
        caches.match(event.request)
            .then(response => {
                // Als het in de cache zit, geef het direct terug
                if (response) {
                    console.log('Service Worker: Bestand gevonden in cache:', event.request.url);
                    return response;
                }
                // Als het niet in de cache zit, haal het op van het netwerk
                console.log('Service Worker: Bestand niet in cache, ophalen via fetch:', event.request.url);
                return fetch(event.request);
            })
    );
});


// Event listener voor wanneer de gebruiker op de notificatie klikt
self.addEventListener('notificationclick', event => {
    console.log('Notificatie aangeklikt!');
    event.notification.close(); // Sluit de notificatie

    // Probeer een bestaand window/tab te focussen, of open een nieuwe
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});