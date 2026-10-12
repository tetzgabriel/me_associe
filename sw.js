/* Cache do jogo: depois da primeira visita com internet, tudo abre do cache, sem rede.
   O jogo não depende de nenhum servidor (categorias, palavras e sorteio estão nos arquivos).
   Atualização: a cada abertura o app pede uma atualização; ela só substitui o cache se TODOS os
   arquivos novos chegarem, então uma conexão ruim nunca deixa o jogo pela metade. */
var CACHE = 'meassocie-v4';
var ASSETS = ['./', 'index.html', 'style.css', 'words.js', 'words-med.js', 'core.js', 'game.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable-512.png', 'icons/favicon-32.png'];

function fetchAll() {
  return Promise.all(ASSETS.map(function (u) {
    return fetch(new Request(u, { cache: 'reload' })).then(function (res) {
      if (!res.ok) throw new Error(u + ' ' + res.status);
      return res;
    });
  }));
}

function store(responses) {
  return caches.open(CACHE).then(function (c) {
    return Promise.all(responses.map(function (res, i) { return c.put(ASSETS[i], res); }));
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil(fetchAll().then(store).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (e) {
  if (e.data === 'refresh') e.waitUntil(fetchAll().then(store).catch(function () { /* sem rede: mantém o cache */ }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).catch(function () {
      return req.mode === 'navigate' ? caches.match('index.html') : Response.error();
    });
  }));
});
