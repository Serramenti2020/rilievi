/* Service worker dell'app Rilievi: tiene l'app sul tablet così si apre anche senza rete.
   Per aggiornare l'app cambia VERSIONE_CACHE (stessa versione dell'app). Non salva dati dei clienti: quelli stanno nell'app (localStorage e IndexedDB). */
const VERSIONE_CACHE = 'rilievi-v11';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE_CACHE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSIONE_CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  /* prima la rete (se c'è, l'app è sempre aggiornata), altrimenti la copia salvata */
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone();
    caches.open(VERSIONE_CACHE).then(c => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
