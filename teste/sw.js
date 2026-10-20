// Service worker do app (v9.5): guarda o app no celular para ele abrir sem internet.
// - Arquivos do próprio site (página, app.js, logica.js, pdf.js): tenta a internet primeiro (pega a versão nova) e,
//   se não houver ou demorar, usa a cópia guardada.
// - Bibliotecas e fontes (esm.sh, Google Fonts): usa a cópia guardada; só baixa na primeira vez.
// - A planilha (script.google.com) nunca passa por aqui: os dados ficam guardados pelo próprio app (fila.js).
const VERSAO = '10.3';
const ESCOPO = self.registration ? self.registration.scope : '';
const CACHE = `gp-${ESCOPO}-${VERSAO}`;
const BASICOS = ['./', 'index.html', `app.js?v=${VERSAO}`, 'logica.js', `pdf.js?v=${VERSAO}`];

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(BASICOS.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n.startsWith(`gp-${ESCOPO}-`) && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

const ehBiblioteca = (url) => /(^|\.)esm\.sh$/.test(url.hostname) || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  || url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'unpkg.com';

function comLimite(promessa, ms) {
  return new Promise((ok, falha) => {
    const t = setTimeout(() => falha(new Error('demorou')), ms);
    promessa.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); falha(e); });
  });
}

async function internetPrimeiro(req) {
  const c = await caches.open(CACHE);
  try {
    const res = await comLimite(fetch(req), 6000);
    if (res && res.ok) c.put(req, res.clone());
    return res;
  } catch (e) {
    const guardado = await c.match(req) || (req.mode === 'navigate' ? (await c.match('index.html')) || (await c.match('./')) : null);
    if (guardado) return guardado;
    throw e;
  }
}

async function guardadoPrimeiro(req) {
  const c = await caches.open(CACHE);
  const guardado = await c.match(req);
  if (guardado) return guardado;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // planilha: sempre direto (nunca guardar a resposta, os dados do celular ficam com o próprio app)
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com') || /\/exec$/.test(url.pathname) || url.searchParams.has('action')) return;
  if (url.origin === self.location.origin) {
    if (!url.pathname.startsWith(new URL(ESCOPO || self.location.href).pathname)) return;
    ev.respondWith(internetPrimeiro(req));
  } else if (ehBiblioteca(url)) {
    ev.respondWith(guardadoPrimeiro(req));
  }
});

// A página manda a lista do que carregou (bibliotecas e fontes) para guardar já na primeira visita
self.addEventListener('message', (ev) => {
  const d = ev.data || {};
  if (d.tipo !== 'guardar' || !Array.isArray(d.urls)) return;
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(d.urls.map(async (u) => {
      try {
        const url = new URL(u);
        if (!(url.origin === self.location.origin || ehBiblioteca(url))) return;
        if (await c.match(u)) return;
        const res = await fetch(u, url.origin === self.location.origin ? undefined : { mode: 'cors' });
        if (res && res.ok) await c.put(u, res);
      } catch (e) { /* tenta de novo na próxima abertura */ }
    }));
  })());
});
