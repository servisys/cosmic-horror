// Gioco installabile (PWA): manifest e installabilita', service worker con gioco che riparte senza rete, avviso di nuova versione con due build
// diverse (senza ricaricare a meta' partita), tutto schermo, «Ruota il telefono» in verticale, e partenza anche da sottocartella e con CSP
// worker-src 'none' (senza service worker).
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/verifica-pwa.mjs <cartella della build (dist)>
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const DIST_A = process.argv[2];
if (!DIST_A || !existsSync(join(DIST_A, 'sw.js'))) { console.error('serve la cartella della build (con sw.js)'); process.exit(2); }
const OUT = process.env.OUT ?? 'screenshot-pwa';
mkdirSync(OUT, { recursive: true });

// seconda build, diversa dalla prima: un file in piu' e un'altra versione nel service worker (come dopo un nuovo rilascio)
const DIST_B = mkdtempSync(join(tmpdir(), 'ctB-'));
cpSync(DIST_A, DIST_B, { recursive: true });
writeFileSync(join(DIST_B, 'versione.txt'), 'seconda build');
const swA = readFileSync(join(DIST_A, 'sw.js'), 'utf8');
const verA = swA.match(/const VERSIONE = "([0-9a-f]+)"/)[1];
writeFileSync(join(DIST_B, 'sw.js'), swA.replace(verA, 'seconda0build').replace('["./",', '["./","versione.txt",'));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.txt': 'text/plain' };
function server({ prefisso = '/', csp = false } = {}) {
  const st = { radice: DIST_A };
  const s = createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!u.startsWith(prefisso)) { res.writeHead(404); return res.end(); }
    let rel = u.slice(prefisso.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const f = normalize(join(st.radice, rel));
    if (!f.startsWith(normalize(st.radice)) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); return res.end('no'); }
    const h = { 'content-type': MIME[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-cache' };
    if (csp) h['content-security-policy'] = "worker-src 'none'";
    res.writeHead(200, h);
    res.end(readFileSync(f));
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok({ st, s, url: `http://127.0.0.1:${s.address().port}${prefisso}` })));
}

const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 300) }); }
};
const nuovoCtx = (opz = {}) => browser.newContext({ viewport: { width: 956, height: 440 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, ...opz });
const pronto = (p) => p.waitForFunction(() => window.__ct && window.__ct.ctrl.g, null, { timeout: 15000 });
const conSW = (p) => p.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
const errori = [];

const srv = await server();
const Q = '?fazione=custodi&seme=21&pausa=60&tutorial=0';

await prova('manifest: campi richiesti e icone presenti', async () => {
  const m = await (await fetch(srv.url + 'manifest.webmanifest')).json();
  const icone = m.icons.map((i) => i.src);
  const mancanti = [];
  for (const i of icone) if (!(await fetch(srv.url + i)).ok) mancanti.push(i);
  const ok = m.name === 'Cosmic Horror' && m.short_name === 'Cosmic Horror' && m.display === 'fullscreen' && m.display_override.includes('standalone')
    && m.orientation === 'landscape' && m.start_url === './' && m.scope === './' && m.icons.some((i) => i.sizes === '192x192')
    && m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any') && m.icons.some((i) => i.purpose === 'maskable') && !mancanti.length;
  return { ok, dettaglio: JSON.stringify({ display: m.display, orientation: m.orientation, icone, mancanti }) };
});

await prova('installabile (controllo di Chrome sul manifest e sul service worker)', async () => {
  const ctx = await nuovoCtx();
  const p = await ctx.newPage();
  await p.goto(srv.url + Q);
  await pronto(p);
  await p.evaluate(() => navigator.serviceWorker.ready);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Page.enable');
  const r = await cdp.send('Page.getInstallabilityErrors');
  const ap = await cdp.send('Page.getAppManifest');
  await ctx.close();
  return { ok: r.installabilityErrors.length === 0 && (ap.errors ?? []).length === 0, dettaglio: JSON.stringify({ errori: r.installabilityErrors, erroriManifest: ap.errors }) };
});

await prova('service worker: tutta la build in cache e il gioco riparte senza rete', async () => {
  const ctx = await nuovoCtx();
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(srv.url + Q);
  await pronto(p);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await pronto(p);
  await conSW(p);
  const dentro = await p.evaluate(async () => {
    const chiavi = await caches.keys();
    const c = await caches.open(chiavi[0]);
    return { chiavi, n: (await c.keys()).length };
  });
  const attesi = JSON.parse(swA.match(/const FILE = (\[.*\]);/)[1]).length;
  await ctx.setOffline(true);
  await p.reload();
  await pronto(p);
  await p.waitForFunction(() => window.__ct.immagini() > 0, null, { timeout: 15000 });
  const offline = await p.evaluate(() => ({ giocoPartito: !!window.__ct.ctrl.g, texture: window.__ct.immagini() }));
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/offline_gioco_riparte.png` });
  // senza rete si puo' anche aprire l'app senza parametri (schermata iniziale)
  const p2 = await ctx.newPage();
  await p2.goto(srv.url);
  const inizio = await p2.evaluate(() => document.getElementById('inizio').style.display !== 'none');
  await ctx.close();
  return { ok: dentro.n === attesi && offline.giocoPartito && offline.texture > 0 && inizio, dettaglio: JSON.stringify({ inCache: dentro.n, attesi, ...offline, schermataIniziale: inizio }) };
});

await prova('nuova versione: avviso senza ricaricare a meta\' partita, poi aggiornamento al tocco', async () => {
  const s = await server();
  const ctx = await nuovoCtx();
  const p = await ctx.newPage();
  await p.goto(s.url + Q);
  await pronto(p);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await pronto(p);
  await conSW(p);
  await p.evaluate(() => { window.__marcatore = 'stessa pagina'; });
  const prima = await p.evaluate(() => caches.keys());
  s.st.radice = DIST_B; // esce una nuova build
  await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  await p.waitForSelector('#nuova-versione', { timeout: 15000 });
  await p.waitForTimeout(300);
  const testo = await p.textContent('#nuova-versione');
  const stessa = await p.evaluate(() => window.__marcatore);
  await p.screenshot({ path: `${OUT}/avviso_nuova_versione.png` });
  // l'avviso non ricarica da solo
  await p.waitForTimeout(1500);
  const ancora = await p.evaluate(() => window.__marcatore);
  await p.touchscreen.tap(...(await p.evaluate(() => { const r = document.getElementById('nuova-versione').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })));
  await p.waitForFunction(() => window.__marcatore === undefined, null, { timeout: 15000 });
  await pronto(p);
  await conSW(p);
  const dopo = await p.evaluate(() => caches.keys());
  const versioneNuova = await p.evaluate(async () => (await (await fetch('versione.txt')).text()));
  await ctx.close();
  s.s.close();
  const ok = /Nuova versione disponibile - tocca per aggiornare/.test(testo) && /partita in corso/.test(testo) && stessa === 'stessa pagina' && ancora === 'stessa pagina'
    && dopo.length === 1 && dopo[0] !== prima[0] && versioneNuova === 'seconda build';
  return { ok, dettaglio: JSON.stringify({ testo, nonRicaricata: ancora === 'stessa pagina', cacheVecchia: prima, cacheDopo: dopo, versioneNuova }) };
});

await prova('versione del gioco visibile nel menu (schermata iniziale) e nelle Regole', async () => {
  const ctx = await nuovoCtx();
  const p = await ctx.newPage();
  await p.goto(srv.url + '?tutorial=0');
  await pronto(p).catch(() => undefined);
  await p.waitForSelector('#versione');
  const testo = await p.textContent('#versione');
  const attesa = process.env.CT_VERSIONE_ATTESA;
  await p.screenshot({ path: `${OUT}/versione_nel_menu.png` });
  await p.click('button[data-fazione=custodi]');
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g && window.__ct.aree()['btn:regole'], null, { timeout: 15000 });
  const ver = await p.evaluate(() => window.__ct.versione());
  // finestra delle Regole: l'ultima riga e' la versione e nessun testo esce dallo schermo o sta sotto la soglia
  await p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
  const a = await p.evaluate(() => window.__ct.aree()['btn:regole']);
  await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
  await p.waitForTimeout(500);
  const regole = await p.evaluate(() => ({ fuori: window.__ct.fuori(), piccoli: window.__ct.piccoli(), chiusura: !!window.__ct.aree()['regole:chiudi'] }));
  await p.screenshot({ path: `${OUT}/regole_con_versione.png` });
  await ctx.close();
  const formato = /^Versione: (main|v[0-9][^ ]*) · [0-9a-f]{7}(\+modifiche)? · \d{4}-\d{2}-\d{2}$/.test(testo);
  return { ok: formato && testo === 'Versione: ' + ver && (!attesa || ver.includes(attesa)) && regole.chiusura && regole.fuori.length === 0 && regole.piccoli.length === 0, dettaglio: JSON.stringify({ testo, ver, attesa: attesa ?? null, regole }) };
});

await prova('tutto schermo al primo tocco (dove il browser lo permette)', async () => {
  const ctx = await nuovoCtx();
  const p = await ctx.newPage();
  await p.goto(srv.url + Q);
  await pronto(p);
  const prima = await p.evaluate(() => !!document.fullscreenElement);
  await p.touchscreen.tap(400, 200);
  await p.waitForTimeout(600);
  const dopo = await p.evaluate(() => !!document.fullscreenElement);
  await ctx.close();
  return { ok: !prima && dopo, dettaglio: JSON.stringify({ prima, dopo }) };
});

await prova('«Ruota il telefono» in verticale e niente in orizzontale', async () => {
  const ctx = await nuovoCtx({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(srv.url + Q);
  await pronto(p);
  const vis = () => p.evaluate(() => getComputedStyle(document.getElementById('ruota')).display !== 'none');
  const verticale = await vis();
  const testo = await p.textContent('#ruota');
  await p.screenshot({ path: `${OUT}/ruota_il_telefono.png` });
  await p.setViewportSize({ width: 844, height: 390 });
  await p.waitForTimeout(300);
  const orizzontale = await vis();
  await ctx.close();
  return { ok: verticale && !orizzontale && /Ruota il telefono/.test(testo), dettaglio: JSON.stringify({ verticale, orizzontale }) };
});

srv.s.close();

for (const [nome, opz] of [['da sottocartella', { prefisso: '/x/y/' }], ['da sottocartella con CSP worker-src \'none\' (niente service worker)', { prefisso: '/x/y/', csp: true }]]) {
  await prova(`gioco parte ${nome}`, async () => {
    const s = await server(opz);
    const ctx = await nuovoCtx();
    const p = await ctx.newPage();
    const err = [];
    p.on('pageerror', (e) => err.push(e.message));
    await p.goto(s.url + Q);
    await pronto(p);
    await p.waitForFunction(() => window.__ct.immagini() > 0, null, { timeout: 15000 });
    await p.waitForTimeout(1500);
    const sw = await p.evaluate(async () => ({ controller: !!navigator.serviceWorker.controller, reg: !!(await navigator.serviceWorker.getRegistration()) }));
    const giocoOk = await p.evaluate(() => !!window.__ct.ctrl.g);
    await ctx.close();
    s.s.close();
    const atteso = opz.csp ? !sw.reg : true;
    return { ok: giocoOk && err.length === 0 && atteso, dettaglio: JSON.stringify({ giocoOk, sw, erroriPagina: err }) };
  });
}

await browser.close();
rmSync(DIST_B, { recursive: true, force: true });
let ko = 0;
for (const e of esiti) { if (!e.ok) ko++; console.log(`${e.ok ? 'OK ' : 'KO '} ${e.nome} - ${e.dettaglio}`); }
if (errori.length) { ko++; console.log('ERRORI DELLA PAGINA:', [...new Set(errori)].slice(0, 5)); }
console.log(ko ? `FINE: ${ko} problemi` : 'FINE: tutto ok');
process.exit(ko ? 1 : 0);
