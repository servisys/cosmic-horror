// Indirizzo da provare per gli script di verifica: se c'e' un server di sviluppo su 5183 (npm run dev) usa quello,
// altrimenti serve la cartella dist (npm run build) con un piccolo server locale sulla stessa macchina.
// Cosi' `npm run leggibilita` e le altre verifiche funzionano anche senza avviare nulla a mano (basta aver fatto la build).
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};

export async function indirizzoDiProva(daRiga) {
  if (daRiga) return daRiga;
  const sviluppo = 'http://127.0.0.1:5183/';
  try {
    const r = await fetch(sviluppo, { signal: AbortSignal.timeout(1500) });
    if (r.ok) return sviluppo;
  } catch { /* nessun server di sviluppo */ }
  const radice = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
  if (!existsSync(join(radice, 'index.html'))) throw new Error('Manca la cartella dist: lancia prima npm run build (oppure avvia npm run dev)');
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let f = join(radice, u.endsWith('/') ? u + 'index.html' : u);
    if (!f.startsWith(radice) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end('manca ' + u); }
    res.writeHead(200, { 'content-type': TIPI[extname(f)] ?? 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  server.unref();
  return `http://127.0.0.1:${server.address().port}/`;
}
