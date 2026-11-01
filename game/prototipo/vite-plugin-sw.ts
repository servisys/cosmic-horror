// Service worker scritto a mano, generato alla fine della build: mette in cache tutti i file del gioco (circa 5 MB) cosi' parte anche senza rete.
// La versione e' un'impronta del contenuto dei file: cambia solo se cambia qualcosa. Il nuovo service worker aspetta (non si attiva da solo):
// il gioco mostra l'avviso «Nuova versione disponibile» e, al tocco, gli manda «aggiorna».
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import type { Plugin } from 'vite';

function elenco(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? elenco(p) : [p];
  });
}

const SW = (versione: string, file: string[]): string => `// Generato dalla build (vite-plugin-sw.ts): non modificare a mano.
const VERSIONE = ${JSON.stringify(versione)};
const CACHE = 'ct-' + VERSIONE;
const FILE = ${JSON.stringify(file)};

self.addEventListener('install', (e) => {
  // niente skipWaiting: la nuova versione si attiva solo quando chi gioca tocca l'avviso (non a meta' partita)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE.map((f) => new URL(f, self.registration.scope).href))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chiavi) => Promise.all(chiavi.filter((k) => k.startsWith('ct-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'aggiorna') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  // la cache vale anche con parametri nell'indirizzo (?fazione=custodi&seme=3) e per l'apertura dell'app
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const trovato = (await c.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await c.match(new URL('./', self.registration.scope).href, { ignoreSearch: true }) : undefined);
      if (trovato) return trovato;
      return fetch(r);
    }),
  );
});
`;

export function serviceWorkerPlugin(): Plugin {
  let outDir = '';
  return {
    name: 'ct-service-worker',
    apply: 'build',
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      const file = elenco(outDir)
        .map((p) => relative(outDir, p).split(sep).join('/'))
        .filter((f) => f !== 'sw.js' && f !== 'staticwebapp.config.json' && !f.endsWith('.map'))
        .sort();
      const h = createHash('sha1');
      for (const f of file) h.update(f).update(readFileSync(join(outDir, f)));
      const versione = h.digest('hex').slice(0, 12);
      // «./» e' l'apertura dell'app (index.html)
      writeFileSync(join(outDir, 'sw.js'), SW(versione, ['./', ...file]));
    },
  };
}
