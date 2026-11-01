// Verifica della tappa 4 con Playwright: mano, campo, carta ingrandita per tipo (custode, risvegliato, evento, territorio), a 956x440 e a 1280x800.
// Uso: CT_CHROMIUM=<percorso chrome> OUT=<cartella screenshot> node scripts/verifica-tappa4.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://127.0.0.1:5183/';
const OUT = process.env.OUT ?? 'screenshot-tappa4';
mkdirSync(OUT, { recursive: true });
const VISTE = [{ nome: '956x440', w: 956, h: 440 }, { nome: '1280x800', w: 1280, h: 800 }];

const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const risultati = [];
for (const vista of VISTE) {
  const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h } });
  const page = await ctx.newPage();
  const problemi = [];
  page.on('console', (m) => { if (m.type() === 'error') problemi.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problemi.push('pageerror: ' + e.message));
  await page.goto(`${URL}?fazione=custodi&seme=21&pausa=120&pausaEvento=60000&tutorial=0`);
  await page.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  await page.waitForTimeout(600);
  const fatti = new Set();
  const sforati = new Set();
  const controllaFuori = async () => { for (const t of await page.evaluate(() => window.__ct.fuori())) sforati.add(t); };
  const foto = async (nome) => { await page.waitForTimeout(200); await controllaFuori(); await page.screenshot({ path: `${OUT}/${vista.nome}_${nome}.png` }); fatti.add(nome); };
  const stato = () => page.evaluate(() => {
    const c = window.__ct.ctrl; const v = c.vista();
    return { fine: c.finita, tuo: c.tuoTurno, dec: !!c.decisione, evento: !!c.evento, comp: c.tocca_al_computer, n: c.g.s.registro.length,
      mano: v.mano.map((x) => ({ uid: x.uid, id: x.id })), mie: v.territori.flatMap((t) => t.mie.map((p) => p.uid)), loro: v.territori.flatMap((t) => t.loro.map((p) => ({ uid: p.uid, id: p.id }))),
      scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
  });
  const clic = async (id) => {
    await page.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined);
    const a = await page.evaluate((i) => window.__ct.aree()[i] ?? null, id);
    if (!a) throw new Error(`area ${id} non trovata`);
    await page.mouse.click(a.x + a.w / 2, a.y + a.h / 2);
    await page.waitForTimeout(150);
  };
  const esiste = async (id) => { await page.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined); return page.evaluate((i) => !!window.__ct.aree()[i], id); };
  const chiudiGrande = async () => { await clic('grande:chiudi'); await page.mouse.move(2, 2); await page.waitForTimeout(120); };
  const altoTesto = () => page.evaluate(() => window.__ct.fuori().length);

  let guardia = 0;
  while (guardia++ < 3000 && !(fatti.has('4_evento') && fatti.has('5_zoom_territorio'))) {
    const s = await stato();
    if (s.fine) break;
    if (await page.evaluate(() => !!window.__ct.scena())) { await clic('scena:indietro'); continue; } // vedi verifica-tappa3
    if (s.evento) {
      await foto('4_evento');
      await clic('evento:chiudi');
      continue;
    }
    if (s.comp) { await page.waitForTimeout(80); continue; }
    if (s.dec) { await clic('btn:tieni'); continue; }
    if (!s.tuo) { await page.waitForTimeout(80); continue; }
    if (!fatti.has('1_mano_campo') && s.mano.length >= 4 && s.loro.length >= 1 && s.mie.length >= 1) {
      await page.mouse.move(2, 2);
      await page.mouse.move(6, 6);
      await page.waitForTimeout(250);
      if (await page.evaluate(() => window.__ct.zoomAttivo())) problemi.push('l\'ingrandimento al passaggio e\' rimasto dopo aver spostato il mouse');
      await foto('1_mano_campo');
      // carta ingrandita: una carta dei Custodi dalla mano (lente)
      await clic(`lente:${s.mano[0].uid}`);
      await foto('2_zoom_custode');
      await chiudiGrande();
      // carta dei Risvegliati in campo (tocco)
      await clic(`pres:${s.loro[0].uid}`);
      await foto('3_zoom_risvegliato');
      await chiudiGrande();
      // territorio: tocco sul nome
      await clic('terrnome:0');
      await foto('5_zoom_territorio');
      await chiudiGrande();
      fatti.add('mano_fatta');
    }
    const m = await page.evaluate(() => window.__ct.suggerisci());
    const prima = s.n;
    if (m.t === 'fine') await clic('btn:fine');
    else if (m.t === 'riduci') await clic('btn:riduci');
    else if (m.t === 'tappa') await clic(`btn:tappa:${m.terr}`);
    else if (m.t === 'gioca') {
      await clic(`mano:${m.carta}`);
      if (m.terr !== undefined) await clic(`terr:${m.terr}`);
      if (m.pres !== undefined && (await esiste(`pres:${m.pres}`))) await clic(`pres:${m.pres}`);
      if (m.cerca !== undefined) await clic(`cerca:${m.cerca}`);
      if (await esiste('btn:gioca')) await clic('btn:gioca');
    }
    const dopo = await stato();
    if (dopo.n <= prima && !dopo.fine) problemi.push(`mossa senza effetto: ${JSON.stringify(m)}`);
  }
  const fin = await stato();
  risultati.push({ vista: vista.nome, foto: [...fatti].filter((x) => x !== 'mano_fatta'), testiFuoriSchermo: [...sforati], scroll: fin.scroll, viewport: [vista.w, vista.h], problemi });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(risultati, null, 1));
const male = risultati.filter((r) => r.foto.length < 5 || r.testiFuoriSchermo.length || r.problemi.length || r.scroll[0] > r.viewport[0] || r.scroll[1] > r.viewport[1]);
process.exit(male.length ? 1 : 0);
