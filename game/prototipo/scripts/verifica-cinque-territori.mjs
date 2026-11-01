// Verifica dei cinque territori con Playwright (CT-FEAT-002), dall'interfaccia vera, a 956x440 e 740x340 con tocco:
//  1. R'lyeh e' il luogo dell'ultima tappa: la targhetta «ULTIMA TAPPA» e' spenta sotto le 2 tappe, accesa da 2 in su (plancia e scena);
//  2. Pietre ritte di Dunwich: bottone, pannello con territorio e segno, la mossa cambia l'instabilita' e costa 1 energia, una volta per turno;
//  3. Pietra Incisa: dopo il territorio si sceglie il segno;
//  4. una partita completa per fazione giocata CLICCANDO, vinta dall'umano con l'ultima tappa a R'lyeh.
// Gli screenshot vanno in scambio/da-claude/cinque-territori/ (o in OUT).
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/verifica-cinque-territori.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { indirizzoDiProva } from './server-prova.mjs';

const URL = await indirizzoDiProva(process.argv[2]);
const OUT = process.env.OUT ?? '../../scambio/da-claude/cinque-territori';
mkdirSync(OUT, { recursive: true });
const VISTE = [{ nome: '956x440', w: 956, h: 440 }, { nome: '740x340', w: 740, h: 340 }];
const DUNWICH = 3;
const RLYEH = 4;

const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const errori = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 300) }); }
};

async function apri(vista, query) {
  const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL + query);
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  const ferma = () => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
  const a = {
    p, ctx, ferma,
    ha: async (id) => { await ferma(); return p.evaluate((i) => !!window.__ct.aree()[i], id); },
    tap: async (id) => {
      await ferma();
      const r = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
      if (!r) throw new Error('area ' + id + ' non trovata');
      await p.touchscreen.tap(r.x + r.w / 2, r.y + r.h / 2);
      await p.waitForTimeout(220);
    },
    turno: async () => { for (let i = 0; i < 80 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150); await ferma(); },
    foto: async (nome) => { await ferma(); await p.waitForTimeout(150); await p.screenshot({ path: `${OUT}/${vista.nome}_${nome}.png` }); },
    /** Cambia lo stato di gioco direttamente (solo per preparare la prova) e ridisegna. */
    muta: async (fn, arg) => {
      await p.evaluate(({ src, arg }) => { new Function('c', 'arg', src)(window.__ct.ctrl, arg); window.dispatchEvent(new Event('resize')); }, { src: `(${fn.toString()})(c, arg)`, arg });
      await ferma();
    },
    testiOk: async () => {
      const pic = await p.evaluate(() => window.__ct.piccoli());
      const fu = await p.evaluate(() => window.__ct.fuori());
      return { ok: pic.length === 0 && fu.length === 0, dettaglio: `${pic.length ? 'sotto la soglia: ' + JSON.stringify(pic.slice(0, 4)) : ''}${fu.length ? ' fuori schermo: ' + fu.join(', ') : ''}` };
    },
  };
  return a;
}

for (const vista of VISTE) {
  await prova(`${vista.nome}: R'lyeh, ultima tappa: targhetta spenta sotto 2 tappe, accesa e pulsante da 2 in su (plancia e scena)`, async () => {
    const a = await apri(vista, '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    await a.turno();
    const spenta = (await a.ha('ultima-tappa:spenta')) && !(await a.ha('ultima-tappa:accesa'));
    await a.foto('1_rlyeh_ultima_tappa_spenta');
    const t1 = await a.testiOk();
    await a.muta((c) => {
      const mio = c.g.s.giocatori[c.umano];
      mio.tappe = { 0: c.g.s.turniCompletati - 5, 1: c.g.s.turniCompletati - 5 };
    });
    const accesa = (await a.ha('ultima-tappa:accesa')) && !(await a.ha('ultima-tappa:spenta'));
    await a.foto('2_rlyeh_ultima_tappa_accesa');
    const t2 = await a.testiOk();
    await a.tap(`terr:${RLYEH}`);
    await a.p.waitForTimeout(400);
    const scena = await a.p.evaluate(() => window.__ct.scena());
    const nellaScena = await a.ha('ultima-tappa:accesa');
    await a.foto('3_scena_rlyeh');
    const t3 = await a.testiOk();
    await a.ctx.close();
    return { ok: spenta && accesa && scena === 'rlyeh' && nellaScena && t1.ok && t2.ok && t3.ok, dettaglio: JSON.stringify({ spenta, accesa, scena, nellaScena, testi: [t1.dettaglio, t2.dettaglio, t3.dettaglio] }) };
  });

  await prova(`${vista.nome}: Pietre ritte di Dunwich: bottone, pannello, +1 su R'lyeh, costo 1 energia, una volta per turno`, async () => {
    const a = await apri(vista, '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    await a.turno();
    const prima = await a.p.evaluate(() => window.__ct.ctrl.puoPietre());
    await a.muta((c) => {
      const mio = c.g.s.giocatori[c.umano];
      mio.energia = 5;
      const dun = c.g.s.territori[3];
      dun.presenze[c.umano].push({ uid: 9100, carta: { uid: 9100, id: 'CU03', trasformata: false }, bonus: 0 });
      dun.controllo = c.umano;
    });
    const dopo = await a.p.evaluate(() => window.__ct.ctrl.puoPietre());
    const bottone = await a.ha('btn:pietre');
    await a.foto('4_pietre_ritte_bottone');
    const t1 = await a.testiOk();
    await a.tap('btn:pietre');
    const pannello = await a.ha('pietre:annulla');
    await a.foto('5_pietre_ritte_pannello');
    const t2 = await a.testiOk();
    const inst0 = await a.p.evaluate((r) => window.__ct.ctrl.g.s.territori[r].inst, RLYEH);
    const en0 = await a.p.evaluate(() => window.__ct.ctrl.vista().energia);
    await a.tap(`pietre:${RLYEH}:piu`);
    const inst1 = await a.p.evaluate((r) => window.__ct.ctrl.g.s.territori[r].inst, RLYEH);
    const en1 = await a.p.evaluate(() => window.__ct.ctrl.vista().energia);
    const chiuso = !(await a.ha('pietre:annulla'));
    const usata = !(await a.p.evaluate(() => window.__ct.ctrl.puoPietre())) && !(await a.ha('btn:pietre'));
    const registro = await a.p.evaluate(() => JSON.stringify(window.__ct.ctrl.g.s.registro.at(-1).m));
    await a.ctx.close();
    return {
      ok: !prima && dopo && bottone && pannello && inst1 === inst0 + 1 && en1 === en0 - 1 && chiuso && usata && registro === JSON.stringify({ t: 'pietre', terr: RLYEH, segno: 1 }) && t1.ok && t2.ok,
      dettaglio: JSON.stringify({ prima, dopo, bottone, pannello, inst: [inst0, inst1], energia: [en0, en1], chiuso, usata, registro, testi: [t1.dettaglio, t2.dettaglio] }),
    };
  });

  await prova(`${vista.nome}: Pietra Incisa: carta, territorio, poi scelta del segno`, async () => {
    const a = await apri(vista, '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    await a.turno();
    await a.muta((c) => {
      const mio = c.g.s.giocatori[c.umano];
      mio.energia = 5;
      mio.mano = [{ uid: 9200, id: 'T4r', trasformata: false }];
      c.g.s.territori[2].inst = 3;
    });
    const giocabile = await a.p.evaluate(() => window.__ct.ctrl.giocabile(9200));
    await a.tap('mano:9200'); // l'unica carta della mano: il tocco la alza e la sceglie
    const selezionata = await a.p.evaluate(() => window.__ct.ctrl.selezione.carta);
    await a.tap('terr:2');
    const pannello = (await a.ha('segno:piu')) && (await a.ha('segno:meno'));
    await a.foto('6_pietra_incisa_segno');
    if (!pannello) {
      const dbg = await a.p.evaluate(() => ({ sel: window.__ct.ctrl.selezione, opz: window.__ct.ctrl.opzioni(), scena: window.__ct.scena(), n: window.__ct.ctrl.g.s.registro.length }));
      await a.ctx.close();
      return { ok: false, dettaglio: 'pannello del segno non aperto ' + JSON.stringify({ ...dbg, selezionata, giocabile }) };
    }
    const t = await a.testiOk();
    await a.tap('segno:meno');
    const inst = await a.p.evaluate(() => window.__ct.ctrl.g.s.territori[2].inst);
    const registro = await a.p.evaluate(() => JSON.stringify(window.__ct.ctrl.g.s.registro.at(-1).m));
    await a.ctx.close();
    return { ok: selezionata === 9200 && pannello && inst === 2 && /"segno":-1/.test(registro) && t.ok, dettaglio: JSON.stringify({ selezionata, pannello, inst, registro, testi: t.dettaglio }) };
  });
}

// partita completa per fazione, giocata cliccando (le mosse le suggerisce il computer, come se fosse il giocatore)
for (const [fazione, seme] of [['custodi', 21], ['risvegliati', 22]]) {
  const vista = VISTE[0];
  await prova(`${vista.nome}: partita completa dei ${fazione} vinta dall'interfaccia, con l'ultima tappa a R'lyeh`, async () => {
    const a = await apri(vista, `?fazione=${fazione}&seme=${seme}&pausa=80&pausaEvento=1000&tutorial=0`);
    const { p } = a;
    const stato = () => p.evaluate(() => {
      const c = window.__ct.ctrl;
      return { fine: c.finita, tuo: c.tuoTurno, dec: !!c.decisione, evento: !!c.evento, comp: c.tocca_al_computer, n: c.g.s.registro.length };
    });
    let mosse = 0;
    let pietre = 0;
    let incise = 0;
    let guardia = 0;
    const problemi = [];
    while (guardia++ < 4000) {
      const s = await stato();
      if (s.fine) break;
      if (await p.evaluate(() => !!window.__ct.scena())) { await a.tap('scena:indietro'); continue; }
      if (s.evento) { await a.tap('evento:chiudi'); continue; }
      if (s.comp) { await p.waitForTimeout(60); continue; }
      if (s.dec) { await a.tap('btn:tieni'); continue; }
      if (!s.tuo) { await p.waitForTimeout(60); continue; }
      const m = await p.evaluate(() => window.__ct.suggerisci());
      mosse++;
      if (m.t === 'fine') await a.tap('btn:fine');
      else if (m.t === 'riduci') await a.tap('btn:riduci');
      else if (m.t === 'tappa') await a.tap(`btn:tappa:${m.terr}`);
      else if (m.t === 'pietre') { pietre++; await a.tap('btn:pietre'); await a.tap(`pietre:${m.terr}:${m.segno > 0 ? 'piu' : 'meno'}`); }
      else if (m.t === 'gioca') {
        await a.tap(`mano:${m.carta}`);
        if (m.terr !== undefined) await a.tap(`terr:${m.terr}`);
        if (m.segno !== undefined && (await a.ha('segno:piu'))) { incise++; await a.tap(m.segno > 0 ? 'segno:piu' : 'segno:meno'); }
        if (m.pres !== undefined && (await a.ha(`pres:${m.pres}`))) await a.tap(`pres:${m.pres}`);
        if (m.cerca !== undefined) await a.tap(`cerca:${m.cerca}`);
        if (await a.ha('btn:gioca')) await a.tap('btn:gioca');
      } else throw new Error('mossa inattesa ' + JSON.stringify(m));
      const dopo = await stato();
      if (dopo.n <= s.n && !dopo.fine) problemi.push(`mossa senza effetto: ${JSON.stringify(m)}`);
      if (problemi.length > 3) break;
    }
    await p.waitForTimeout(300);
    await a.foto(`7_partita_${fazione}_fine`);
    const fin = await p.evaluate(() => {
      const c = window.__ct.ctrl;
      const s = c.g.s;
      return { finita: c.finita, vincitore: s.vincitore === null ? null : s.giocatori[s.vincitore].fazione, tappeVincitore: s.vincitore === null ? [] : Object.keys(s.giocatori[s.vincitore].tappe).map(Number), giri: s.giro, scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
    });
    const fuori = await p.evaluate(() => window.__ct.fuori());
    await a.ctx.close();
    const vintaDaUmano = fin.vincitore === fazione;
    const aRlyeh = fin.tappeVincitore.includes(RLYEH) && fin.tappeVincitore.length === 3;
    return {
      ok: fin.finita && vintaDaUmano && aRlyeh && !problemi.length && !fuori.length && fin.scroll[0] <= vista.w && fin.scroll[1] <= vista.h,
      dettaglio: JSON.stringify({ ...fin, mosseUmano: mosse, pietreRitte: pietre, pietraIncisa: incise, problemi, fuori }),
    };
  });
}

await browser.close();
let ko = 0;
for (const e of esiti) { if (!e.ok) ko++; console.log(`${e.ok ? 'OK ' : 'KO '} ${e.nome} - ${e.dettaglio}`); }
if (errori.length) { ko++; console.log('ERRORI DELLA PAGINA:', [...new Set(errori)].slice(0, 5)); }
console.log(ko ? `FINE: ${ko} problemi` : 'FINE: tutto ok');
process.exit(ko ? 1 : 0);
