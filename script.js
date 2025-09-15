let deferredPrompt;
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');

    // Registreer de Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker geregistreerd!', registration))
            .catch(error => console.error('Service Worker registratie mislukt:', error));
    }

    startButton.addEventListener('click', () => {
        console.log('Tracking gestart...');
        startButton.style.display = 'none'; // Verberg de knop na het starten
        startTracking();
    });
});

// --- Configuratie ---
const dirkCoords = {
    lat: 51.88511875058895,
    lon: 4.489319736158438
};
const radiusInMeters = 50;
let hasArrived = false; // Vlag om te zorgen dat we maar één keer notificeren

// --- Functies ---

function startTracking() {
    // 1. Vraag toestemming voor notificaties
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Je moet notificaties toestaan om deze app te gebruiken!');
            return;
        }

        // 2. Start Geolocation tracking
        if ('geolocation' in navigator) {
            const watchOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };
            navigator.geolocation.watchPosition(locationSuccess, locationError, watchOptions);
        } else {
            alert('Geolocation wordt niet ondersteund door je browser.');
        }
    });
}

function locationSuccess(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    console.log(`Huidige locatie: ${userLat}, ${userLon}`);

    // Bereken de afstand tot de Dirk
    const distance = calculateDistance(userLat, userLon, dirkCoords.lat, dirkCoords.lon);
    console.log(`Afstand tot Dirk: ${distance.toFixed(2)} meter.`);

    // Check of we binnen de straal zijn en nog niet zijn "aangekomen"
    if (distance <= radiusInMeters && !hasArrived) {
        hasArrived = true; // Zet de vlag!
        
        sendArrivalNotification();
        updateUItoArrived();
    }
}

function locationError(error) {
    console.error(`Geolocation Fout: ${error.message}`);
}

function updateUItoArrived() {
    const container = document.getElementById('status-container');
    const text = document.getElementById('status-text');

    container.classList.remove('not-arrived');
    container.classList.add('arrived');
    text.textContent = 'Yippie! Je bent aangekomen.';
    document.querySelector('#status-container p').style.display = 'none'; // Verberg de subtekst
}

function sendArrivalNotification() {
    const title = 'Yippiee, je bent aangekomen bij de Dirk!';
    const options = {
        body: 'Op naar de frikandelbroodjes!',
        icon: 'icons/dirk-logo.png', // Zorg dat dit pad klopt!
        badge: 'icons/dirk-logo.png' // Voor Android
    };

    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
    });
}

// Haversine-formule om afstand tussen twee GPS-punten te berekenen (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius van de Aarde in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}