// Verifica della tappa 3 con Playwright: una partita completa per fazione, a 956x440 e a 1280x800, giocata CLICCANDO sull'interfaccia.
// La mossa da fare la suggerisce il computer (come se fosse il giocatore); poi la si esegue con i clic sulle aree della scena.
// Uso: CT_CHROMIUM=<percorso chrome> OUT=<cartella screenshot> node scripts/verifica-tappa3.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://127.0.0.1:5183/';
const OUT = process.env.OUT ?? 'screenshot-tappa3';
mkdirSync(OUT, { recursive: true });
const SEMI = { custodi: 21, risvegliati: 22 };
const VISTE = [{ nome: '956x440', w: 956, h: 440 }, { nome: '1280x800', w: 1280, h: 800 }];

const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const risultati = [];
for (const vista of VISTE) {
  for (const fazione of ['custodi', 'risvegliati']) {
    const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const problemi = [];
    page.on('console', (m) => { if (m.type() === 'error') problemi.push('console: ' + m.text()); });
    page.on('pageerror', (e) => problemi.push('pageerror: ' + e.message));
    await page.goto(`${URL}?fazione=${fazione}&seme=${SEMI[fazione]}&pausa=120&pausaEvento=1200&tutorial=0`);
    await page.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
    const sigla = `${fazione}_${vista.nome}`;
    const foto = async (momento) => page.screenshot({ path: `${OUT}/${sigla}_${momento}.png` });
    const fatti = new Set();
    const sforati = new Set();
    const una = async (momento) => { if (fatti.has(momento)) return; fatti.add(momento); await foto(momento); };
    const stato = () => page.evaluate(() => {
      const c = window.__ct.ctrl;
      return { fine: c.finita, tuo: c.tuoTurno, dec: !!c.decisione, evento: !!c.evento, comp: c.tocca_al_computer, giro: c.g.s.giro, n: c.g.s.registro.length,
        segnaleMio: c.vista().segnaleMio, segnaleAvv: c.vista().segnaleAvv, scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
    });
    const clic = async (id) => {
      const a = await page.evaluate((i) => window.__ct.aree()[i] ?? null, id);
      if (!a) throw new Error(`area ${id} non trovata`);
      await page.mouse.click(a.x + a.w / 2, a.y + a.h / 2);
      await page.waitForTimeout(90);
    };
    const esiste = (id) => page.evaluate((i) => !!window.__ct.aree()[i], id);

    await page.waitForTimeout(400);
    await una('1_inizio');
    let mosse = 0;
    let carteGiocate = 0;
    let guardia = 0;
    let scrollMax = [0, 0];
    while (guardia++ < 4000) {
      const s = await stato();
      scrollMax = [Math.max(scrollMax[0], s.scroll[0]), Math.max(scrollMax[1], s.scroll[1])];
      for (const t of await page.evaluate(() => window.__ct.fuori())) sforati.add(t);
      if (s.fine) break;
      if (s.segnaleMio || s.segnaleAvv) await una('5_segnale');
      if (s.evento) {
        await una('4_evento_cosmico');
        await clic('evento:chiudi');
        continue;
      }
      if (s.comp) { await una('3_turno_computer'); await page.waitForTimeout(80); continue; }
      if (s.dec) {
        await una('6_riordino_biblioteca');
        await clic('btn:tieni');
        continue;
      }
      if (!s.tuo) { await page.waitForTimeout(80); continue; }
      const m = await page.evaluate(() => window.__ct.suggerisci());
      mosse++;
      if (m.t === 'fine') await clic('btn:fine');
      else if (m.t === 'riduci') await clic('btn:riduci');
      else if (m.t === 'tappa') await clic(`btn:tappa:${m.terr}`);
      else if (m.t === 'gioca') {
        await clic(`mano:${m.carta}`);
        if (carteGiocate === 0) await una('2a_carta_selezionata');
        if (m.terr !== undefined) await clic(`terr:${m.terr}`);
        if (m.pres !== undefined && (await esiste(`pres:${m.pres}`))) await clic(`pres:${m.pres}`);
        if (m.cerca !== undefined) await clic(`cerca:${m.cerca}`);
        if (await esiste('btn:gioca')) await clic('btn:gioca');
        carteGiocate++;
        if (carteGiocate === 1) { await page.waitForTimeout(150); await una('2b_carta_giocata'); }
      } else throw new Error('mossa inattesa ' + JSON.stringify(m));
      const dopo = await stato();
      if (dopo.n <= s.n && !dopo.fine) problemi.push(`la mossa ${JSON.stringify(m)} non ha avuto effetto (registro fermo a ${s.n})`);
    }
    await page.waitForTimeout(400);
    const fin = await stato();
    await una('7_fine_partita');
    // pulsante "Copia il registro della partita" a fine partita
    await clic('fine:copia');
    await page.waitForTimeout(300);
    const copiato = await page.evaluate(() => window.__registroCopiato ?? '');
    let regOk = false;
    try { const j = JSON.parse(copiato); regOk = Array.isArray(j.mosse) && j.mosse.length > 0 && j.esito !== 'in corso'; } catch { /* non JSON */ }
    const esito = await page.evaluate(() => { const c = window.__ct.ctrl; return c.g.s.vincitore === null ? 'interrotta' : c.g.s.giocatori[c.g.s.vincitore].fazione; });
    risultati.push({ vista: vista.nome, fazione, finita: fin.fine, giri: fin.giro, mosseUmano: mosse, esito, registroCopiato: regOk, scroll: scrollMax, testiFuoriSchermo: [...sforati], viewport: [vista.w, vista.h], problemi, foto: [...fatti] });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(risultati, null, 1));
const male = risultati.filter((r) => !r.finita || !r.registroCopiato || r.problemi.length || r.testiFuoriSchermo.length || r.scroll[0] > r.viewport[0] || r.scroll[1] > r.viewport[1]);
process.exit(male.length ? 1 : 0);
