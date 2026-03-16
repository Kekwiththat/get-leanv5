const cacheName = 'get-lean-v3';
const assets = [
  'index.html',
  'getlean-functions.js',
  'manifest.json',
  'icon.png',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.map(key => { if(key !== cacheName) return caches.delete(key); })
  )));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
