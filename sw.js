/* App do painel (instalado no celular/computador).
   Sempre busca a versão mais nova do painel na internet; a cópia guardada só é usada se estiver sem conexão.
   Não guarda dados: as planilhas continuam cifradas e guardadas pelo próprio painel. */
var CACHE = 'dash-app-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return; // só a página do painel; o resto segue direto para a internet
  e.respondWith(fetch(r, { cache: 'no-store' }).then(function (res) {
    if (res && res.ok) { var c = res.clone(); caches.open(CACHE).then(function (ca) { ca.put('./', c); }); }
    return res;
  }).catch(function () {
    return caches.match('./').then(function (m) { return m || new Response('<meta charset="utf-8"><p style="font-family:sans-serif;padding:24px">Sem internet. Conecte e abra o app de novo.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); });
  }));
});
