self.addEventListener('install', () => {
    // Activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Take control of all clients immediately
    event.waitUntil(self.clients.claim());
});

// No fetch handler implies all requests go to network as normal.
// This effectively overrides any broken service worker that acts as a proxy.
