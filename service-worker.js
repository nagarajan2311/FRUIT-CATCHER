
const CACHE='fruit-catcher-v1';
const ASSETS=[ './','./index.html','./style.css','./game.js','./manifest.json',
'./assets/img/bg.png','./assets/img/basket.png','./assets/img/egg.png','./assets/img/apple.png','./assets/img/banana.png','./assets/img/orange.png',
'./assets/audio/bg.wav','./assets/audio/catch.wav','./assets/audio/miss.wav','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE && caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{ const url=new URL(e.request.url); if(url.origin===location.origin){ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); } });
