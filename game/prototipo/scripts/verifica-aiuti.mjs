// Verifica degli aiuti di gioco a 956x440 in emulazione touch (hasTouch + isMobile):
//  - tutorial alla prima partita (completo, saltato, ricordato, rivisto con il bottone «Come si gioca»);
//  - riga di suggerimento in situazioni diverse (screenshot al primo comparire di ogni tipo);
//  - bottone Sigillo/rito illuminato o spento con il motivo; tappe al sicuro o no; motivo di una carta non giocabile al tocco.
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/verifica-aiuti.mjs <url della pagina>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2];
const OUT = process.env.OUT ?? 'screenshot-aiuti';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const nuovoContesto = () => browser.newContext({ viewport: { width: 956, height: 440 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const esiti = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 220) }); }
};
const storia = [];
const aiuti = (p) => {
  const tap = async (id) => {
    await p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined);
    const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
    if (!a) throw new Error('area ' + id + ' non trovata ' + JSON.stringify(await p.evaluate(() => ({ scena: window.__ct.scena(), sel: window.__ct.ctrl.selezione, grande: !!window.__ct.aree()['grande:chiudi'], dec: !!window.__ct.ctrl.decisione, ev: !!window.__ct.ctrl.evento, tuo: window.__ct.ctrl.tuoTurno, aree: Object.keys(window.__ct.aree()).slice(0, 12) }))) + ' storia: ' + storia.slice(-6).join(' '));
    storia.push(id + '@' + Math.round(a.x + a.w / 2) + ',' + Math.round(a.y + a.h / 2));
    await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
    await p.waitForTimeout(220);
  };
  const ha = async (id) => { await p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 5000 }).catch(() => undefined); return p.evaluate((i) => !!window.__ct.aree()[i], id); };
  const tutorial = () => p.evaluate(() => window.__ct.tutorialAttivo());
  const attendi = async (cond, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await cond()) return true; await p.waitForTimeout(150); } return false; };
  return { tap, ha, tutorial, attendi };
};
const errori = [];
const apri = async (ctx, query) => {
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL + query);
  await p.waitForFunction(() => window.__ct);
  return p;
};

// A - tutorial completo alla prima partita, ricordato dopo
await prova('tutorial completo alla prima partita e non si ripete', async () => {
  const ctx = await nuovoContesto();
  const p = await apri(ctx, '?fazione=custodi&seme=21&pausa=120');
  const a = aiuti(p);
  if (!(await a.attendi(async () => (await a.tutorial()) === 0))) return { ok: false, dettaglio: 'il tutorial non e\' partito' };
  const visti = [];
  for (let passo = 0; passo < 6; passo++) {
    if ((await a.tutorial()) !== passo) return { ok: false, dettaglio: `passo atteso ${passo}, trovato ${await a.tutorial()}` };
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${OUT}/tutorial_${passo + 1}.png` });
    visti.push(passo + 1);
    await a.tap('tut:avanti');
  }
  const finito = (await a.tutorial()) === -1;
  const memoria = await p.evaluate(() => localStorage.getItem('ct_tutorial_visto'));
  await p.reload();
  await p.waitForFunction(() => window.__ct);
  await p.evaluate(() => window.__ct.avvia('custodi', 21));
  await p.waitForTimeout(2500);
  const ripetuto = (await a.tutorial()) !== -1;
  await ctx.close();
  return { ok: finito && memoria === '1' && !ripetuto, dettaglio: JSON.stringify({ passi: visti, finito, memoria, ripetuto }) };
});

// B - tutorial saltato
await prova('tutorial saltato con «Salta»', async () => {
  const ctx = await nuovoContesto();
  const p = await apri(ctx, '?fazione=risvegliati&seme=22&pausa=120');
  const a = aiuti(p);
  if (!(await a.attendi(async () => (await a.tutorial()) === 0))) return { ok: false, dettaglio: 'il tutorial non e\' partito' };
  await a.tap('tut:avanti');
  await a.tap('tut:salta');
  const finito = (await a.tutorial()) === -1;
  const memoria = await p.evaluate(() => localStorage.getItem('ct_tutorial_visto'));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/tutorial_saltato.png` });
  await ctx.close();
  return { ok: finito && memoria === '1', dettaglio: JSON.stringify({ finito, memoria }) };
});

// C - rivedere il tutorial dal bottone della schermata iniziale
await prova('bottone «Come si gioca» dalla schermata iniziale (tutorial gia\' visto)', async () => {
  const ctx = await nuovoContesto();
  await ctx.addInitScript(() => { try { localStorage.setItem('ct_tutorial_visto', '1'); } catch { /* niente */ } });
  const p = await apri(ctx, '');
  const a = aiuti(p);
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/schermata_iniziale.png` });
  await p.tap('#come-si-gioca');
  await p.waitForTimeout(200);
  await p.tap('#inizio button[data-fazione="custodi"]');
  const partito = await a.attendi(async () => (await a.tutorial()) === 0);
  await ctx.close();
  return { ok: partito, dettaglio: partito ? 'il tutorial riparte' : 'il tutorial non e\' partito' };
});

// D - suggerimenti in situazioni diverse, bottone illuminato/spento, tappe, motivo di una carta
const trovati = new Map();
await prova('suggerimenti, bottoni e motivi durante partite complete', async () => {
  for (const [fazione, seme] of [['custodi', 21], ['risvegliati', 22], ['custodi', 5], ['risvegliati', 8]]) {
    const ctx = await nuovoContesto();
    const p = await apri(ctx, `?fazione=${fazione}&seme=${seme}&pausa=60&pausaEvento=300&tutorial=0`);
    const a = aiuti(p);
    let toastVisto = false;
    for (let k = 0; k < 400; k++) {
      const st = await p.evaluate(() => { const c = window.__ct.ctrl; return { fine: c.finita, tuo: c.tuoTurno, dec: !!c.decisione, ev: !!c.evento }; });
      if (st.fine) break;
      if (await p.evaluate(() => !!window.__ct.scena())) { await a.tap('scena:indietro'); continue; } // un tocco al centro mentre l'evento si chiudeva puo' aprire la scena del pozzo
      if (st.ev) { await a.tap('evento:chiudi').catch(() => undefined); continue; } // con pausaEvento breve si chiude anche da solo
      if (st.dec) { await a.tap('btn:tieni'); continue; }
      if (!st.tuo) { await p.waitForTimeout(80); continue; }
      const sug = await p.evaluate(() => window.__ct.suggerimento());
      if (sug) {
        const chiave = sug.tipo;
        const n = trovati.get(chiave) ?? 0;
        trovati.set(chiave, n + 1);
        if (n === 0) {
          await p.waitForTimeout(150);
          await p.screenshot({ path: `${OUT}/suggerimento_${chiave}_${fazione}.png` });
          trovati.set(chiave + '|testo', sug.testo);
        }
      }
      // bottone Sigillo/rito: illuminato (utilizzabile) o spento
      for (let t = 0; t < 3; t++) {
        const pu = await p.evaluate((i) => window.__ct.ctrl.puoTappa(i), t);
        const chiave = pu ? 'bottone-acceso' : 'bottone-spento';
        if (!trovati.has(chiave)) { trovati.set(chiave, 1); await p.screenshot({ path: `${OUT}/${chiave}_${fazione}.png` }); }
      }
      // tappe al sicuro o no
      const tp = await p.evaluate(() => window.__ct.ctrl.vista().territori.map((t) => ({ m: t.mioTappa, tog: t.mioTappaTogliibile })));
      if (tp.some((t) => t.m && t.tog) && !trovati.has('tappa-non-al-sicuro')) { trovati.set('tappa-non-al-sicuro', 1); await p.screenshot({ path: `${OUT}/tappa_non_al_sicuro_${fazione}.png` }); }
      if (tp.some((t) => t.m && !t.tog) && !trovati.has('tappa-al-sicuro')) { trovati.set('tappa-al-sicuro', 1); await p.screenshot({ path: `${OUT}/tappa_al_sicuro_${fazione}.png` }); }
      // carta non giocabile: al tocco dice il motivo
      if (!toastVisto && !trovati.has('motivo-carta')) {
        const nonGiocabile = await p.evaluate(() => { const c = window.__ct.ctrl; return c.vista().mano.find((x) => !c.giocabile(x.uid))?.uid ?? null; });
        if (nonGiocabile !== null) {
          await a.tap(`mano:${nonGiocabile}`);
          const t = await p.evaluate(() => window.__ct.toast());
          if (t) { toastVisto = true; trovati.set('motivo-carta', 1); trovati.set('motivo-carta|testo', t); await p.screenshot({ path: `${OUT}/motivo_carta_non_giocabile.png` }); }
        }
      }
      // mossa del giocatore (suggerita dal computer) con tocchi
      const m = await p.evaluate(() => window.__ct.suggerisci());
      const n0 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      if (m.t === 'fine') await a.tap('btn:fine');
      else if (m.t === 'riduci') await a.tap('btn:riduci');
      else if (m.t === 'tappa') await a.tap(`btn:tappa:${m.terr}`);
      else if (m.t === 'gioca') {
        await a.tap(`mano:${m.carta}`);
        if (m.terr !== undefined) await a.tap(`terr:${m.terr}`);
        if (m.pres !== undefined && (await a.ha(`pres:${m.pres}`))) await a.tap(`pres:${m.pres}`);
        if (m.cerca !== undefined) await a.tap(`cerca:${m.cerca}`);
        if (await a.ha('btn:gioca')) await a.tap('btn:gioca');
      }
      const n1 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      if (n1 <= n0) { const dbg = await p.evaluate(() => ({ sel: window.__ct.ctrl.selezione, opz: window.__ct.ctrl.opzioni(), grande: !!window.__ct.aree()['grande:chiudi'], tut: window.__ct.tutorialAttivo() })); await p.screenshot({ path: `${OUT}/_errore.png` }); await ctx.close(); return { ok: false, dettaglio: 'mossa senza effetto: ' + JSON.stringify(m) + ' ' + JSON.stringify(dbg) }; }
    }
    await ctx.close();
  }
  const tipi = [...trovati.keys()].filter((k) => !k.includes('|') && !['bottone-acceso', 'bottone-spento', 'tappa-non-al-sicuro', 'tappa-al-sicuro', 'motivo-carta'].includes(k));
  const testi = Object.fromEntries([...trovati.entries()].filter(([k]) => k.includes('|')).map(([k, v]) => [k.replace('|testo', ''), v]));
  writeFileSync(`${OUT}/testi_suggerimenti.json`, JSON.stringify({ tipi, testi }, null, 1));
  const ok = tipi.length >= 5 && trovati.has('bottone-acceso') && trovati.has('bottone-spento') && trovati.has('tappa-non-al-sicuro') && trovati.has('motivo-carta');
  return { ok, dettaglio: JSON.stringify({ tipiSuggerimento: tipi, bottoneAcceso: trovati.has('bottone-acceso'), bottoneSpento: trovati.has('bottone-spento'), tappaNonSicura: trovati.has('tappa-non-al-sicuro'), tappaSicura: trovati.has('tappa-al-sicuro'), motivoCarta: trovati.get('motivo-carta|testo') }) };
});

await browser.close();
if (errori.length) esiti.push({ nome: 'nessun errore in console', ok: false, dettaglio: errori.slice(0, 3).join(' | ') });
else esiti.push({ nome: 'nessun errore in console', ok: true, dettaglio: '' });
for (const e of esiti) console.log(e.ok ? 'OK  ' : 'KO  ', e.nome, '-', e.dettaglio);
process.exit(esiti.every((e) => e.ok) ? 0 : 1);
