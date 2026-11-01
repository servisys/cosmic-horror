// Verifiche per il telefono, su una build servita da una sottocartella:
//  1. i bottoni della schermata iniziale avviano la partita anche senza parametri nell'indirizzo;
//  2. con CSP worker-src 'none' (se il server lo imposta) le immagini compaiono: texture caricate senza web worker;
//  3. con tocco (hasTouch, isMobile): tocco su una carta, poi su un territorio -> carta giocata, e nessuna anteprima resta aperta.
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> [CSP=1] node scripts/prova-telefono.mjs <url della pagina>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { premiArea } from './pressione.mjs';

const URL = process.argv[2];
const OUT = process.env.OUT ?? 'screenshot-telefono';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const eSw = (t) => /sw.js/.test(t); // con la CSP worker-src 'none' il service worker non parte: previsto, il gioco parte lo stesso
const esiti = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 200) }); }
};

// 1. bottoni senza parametri (mouse), con attese diverse prima del clic
for (const attesa of [300, 1500, 3000]) {
  await prova(`bottoni iniziali senza parametri (clic dopo ${attesa} ms)`, async () => {
    for (const f of ['custodi', 'risvegliati']) {
      const ctx = await browser.newContext({ viewport: { width: 956, height: 440 } });
      const p = await ctx.newPage();
      const errori = [];
      p.on('console', (m) => { if (m.type() === 'error' && !eSw(m.text())) errori.push(m.text()); });
      p.on('pageerror', (e) => errori.push(e.message));
      await p.goto(URL);
      await p.waitForTimeout(attesa);
      await p.click(`#inizio button[data-fazione="${f}"]`);
      await p.waitForTimeout(800);
      const stato = await p.evaluate(() => ({ attiva: !!window.__ct.ctrl.g, aree: Object.keys(window.__ct.aree()).length, nascosta: getComputedStyle(document.getElementById('inizio')).display === 'none' }));
      if (f === 'custodi' && attesa === 1500) await p.screenshot({ path: `${OUT}/bottone_iniziale_${f}.png` });
      await ctx.close();
      if (!stato.attiva || stato.aree < 10 || !stato.nascosta || errori.length) return { ok: false, dettaglio: JSON.stringify({ f, stato, errori: errori.slice(0, 2) }) };
    }
    return { ok: true, dettaglio: 'entrambi i bottoni avviano la partita, nessun errore' };
  });
}

// 2. immagini senza worker
await prova('immagini presenti (texture caricate)', async () => {
  const ctx = await browser.newContext({ viewport: { width: 956, height: 440 } });
  const p = await ctx.newPage();
  const errori = [];
  p.on('console', (m) => { if ((m.type() === 'error' || /content security|worker/i.test(m.text())) && !eSw(m.text())) errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(`${URL}?fazione=custodi&seme=21&pausa=120&tutorial=0`);
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  await p.waitForTimeout(1200);
  const n = await p.evaluate(() => window.__ct.immagini());
  await p.screenshot({ path: `${OUT}/immagini_${process.env.CSP === '1' ? 'con_CSP' : 'senza_CSP'}.png` });
  await ctx.close();
  return { ok: n >= 71 && errori.length === 0, dettaglio: JSON.stringify({ texture: n, errori: errori.slice(0, 3) }) };
});

// 3. tocco
await prova('tocco: carta poi territorio gioca la carta; nessuna anteprima resta aperta', async () => {
  const ctx = await browser.newContext({ viewport: { width: 956, height: 440 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errori = [];
  p.on('console', (m) => { if (m.type() === 'error' && !eSw(m.text())) errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(`${URL}?fazione=custodi&seme=21&pausa=120&tutorial=0`);
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  await p.waitForTimeout(800);
  const stabile = () => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined);
  const tap = async (id) => {
    await p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined);
    const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
    if (!a) throw new Error('area ' + id + ' non trovata');
    await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
    await p.waitForTimeout(250);
  };
  for (let i = 0; i < 60 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150);
  let giocate = 0;
  for (let k = 0; k < 40 && giocate < 2; k++) {
    const m = await p.evaluate(() => window.__ct.suggerisci());
    if (m.t === 'fine') break;
    if (m.t !== 'gioca') { await tap(m.t === 'tappa' ? `btn:tappa:${m.terr}` : 'btn:riduci'); continue; }
    const n0 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
    await tap(`mano:${m.carta}`);
    if (await p.evaluate(() => window.__ct.zoomAttivo())) return { ok: false, dettaglio: 'anteprima aperta dopo il tocco su una carta' };
    if (m.terr !== undefined) await tap(`terr:${m.terr}`);
    if (m.pres !== undefined && (await stabile().then(() => p.evaluate((i) => !!window.__ct.aree()[i], `pres:${m.pres}`)))) await tap(`pres:${m.pres}`);
    if (m.cerca !== undefined) await tap(`cerca:${m.cerca}`);
    if (await stabile().then(() => p.evaluate(() => !!window.__ct.aree()['btn:gioca']))) await tap('btn:gioca');
    const n1 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
    if (n1 <= n0) return { ok: false, dettaglio: `la carta non e' stata giocata: ${JSON.stringify(m)}` };
    giocate++;
    if (await p.evaluate(() => !!window.__ct.ctrl.decisione)) await tap('btn:tieni'); // riordino della Biblioteca
    if (await p.evaluate(() => window.__ct.zoomAttivo())) return { ok: false, dettaglio: 'anteprima rimasta aperta dopo aver giocato' };
  }
  await p.screenshot({ path: `${OUT}/tocco_dopo_carte.png` });
  const mano = await p.evaluate(() => window.__ct.ctrl.vista().mano.map((x) => x.uid));
  if (mano.length) {
    await premiArea(p, `mano:${mano[0]}`);
    const aperta = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
    await p.screenshot({ path: `${OUT}/tocco_scheda_grande.png` });
    if (!aperta) return { ok: false, dettaglio: `la pressione lunga non ha aperto la scheda (carta ${mano[0]}, area ${JSON.stringify(await p.evaluate((i) => window.__ct.aree()['mano:' + i], mano[0]))})` };
    await tap('grande:chiudi');
    const chiusa = await p.evaluate(() => !window.__ct.aree()['grande:chiudi']);
    if (!aperta || !chiusa) return { ok: false, dettaglio: `scheda grande: aperta=${aperta} chiusa=${chiusa}` };
  }
  await tap('terrnome:1');
  const t1 = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
  await tap('grande:chiudi');
  const t2 = await p.evaluate(() => !window.__ct.aree()['grande:chiudi'] && !window.__ct.zoomAttivo());
  await ctx.close();
  return { ok: giocate >= 1 && t1 && t2 && errori.length === 0, dettaglio: JSON.stringify({ giocate, schedaTerritorioAperta: t1, chiusa: t2, errori: errori.slice(0, 2) }) };
});

await browser.close();
for (const e of esiti) console.log(e.ok ? 'OK  ' : 'KO  ', e.nome, '-', e.dettaglio);
process.exit(esiti.every((e) => e.ok) ? 0 : 1);
