// Leggibilita' sul telefono: plancia con miniature (anche 4+ carte per lato), mano abbassata e alzata (carte giocabili illuminate),
// scena di un territorio con 2 e con 5 carte, pressione lunga (mano, miniatura, scena) con il tocco vero, misura dei testi sotto la soglia.
// Si provano tre misure: 956x440, 844x390 e 740x340 (telefono orizzontale dentro l'app), tutte con tocco.
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/leggibilita.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { pressioneTocco, premiArea } from './pressione.mjs';

import { indirizzoDiProva } from './server-prova.mjs';
const URL = await indirizzoDiProva(process.argv[2]);
const OUT = process.env.OUT ?? 'screenshot-leggibilita';
mkdirSync(OUT, { recursive: true });
const VISTE = [{ nome: '956x440', w: 956, h: 440 }, { nome: '844x390', w: 844, h: 390 }, { nome: '740x340', w: 740, h: 340 }];
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 300) }); }
};
const errori = [];

for (const vista of VISTE) {
  const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL + '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  const ferma = () => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
  const tap = async (id) => {
    await ferma();
    const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
    if (!a) throw new Error('area ' + id + ' non trovata');
    await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
    await p.waitForTimeout(260);
  };
  const turno = async () => { for (let i = 0; i < 80 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150); await ferma(); };
  const foto = async (nome) => { await ferma(); await p.waitForTimeout(150); await p.screenshot({ path: `${OUT}/${vista.nome}_${nome}.png` }); };
  const piccoli = () => p.evaluate(() => window.__ct.piccoli());
  const fuori = () => p.evaluate(() => window.__ct.fuori());
  const scena = () => p.evaluate(() => window.__ct.scena());
  /** Mette presenze direttamente nello stato (solo per la prova): loro (Risvegliati) e mie (Custodi) in un territorio. */
  const popola = (terr, nLoro, nMie) => p.evaluate(([t, a, b]) => {
    const c = window.__ct.ctrl;
    const ids = [...c.cat.carte.values()].filter((x) => x.tipo === 'presenza');
    const cu = ids.filter((x) => x.id.startsWith('CU')).map((x) => x.id);
    const ri = ids.filter((x) => x.id.startsWith('RI')).map((x) => x.id);
    const ter = c.g.s.territori[t];
    ter.presenze[0].length = 0;
    ter.presenze[1].length = 0;
    const mio = c.g.s.giocatori[0].fazione === 'custodi' ? 0 : 1;
    for (let k = 0; k < b; k++) ter.presenze[mio].push({ uid: 9000 + t * 20 + k, carta: { uid: 9000 + t * 20 + k, id: cu[k % cu.length], trasformata: false }, bonus: 0 });
    for (let k = 0; k < a; k++) ter.presenze[1 - mio].push({ uid: 9500 + t * 20 + k, carta: { uid: 9500 + t * 20 + k, id: ri[k % ri.length], trasformata: false }, bonus: 0 });
    window.dispatchEvent(new Event('resize'));
  }, [terr, nLoro, nMie]);
  const controllaTesti = async (dove) => {
    const pic = await piccoli();
    const fu = await fuori();
    return { ok: pic.length === 0 && fu.length === 0, dettaglio: `${dove}: ${pic.length ? 'sotto la soglia: ' + JSON.stringify(pic.slice(0, 6)) : ''}${fu.length ? ' fuori schermo: ' + fu.join(', ') : ''}` };
  };

  await turno();

  await prova(`${vista.nome}: plancia con miniature (4+ carte per lato) e testi sopra la soglia`, async () => {
    await popola(0, 4, 4);
    await popola(1, 2, 5);
    await popola(2, 1, 2);
    await popola(3, 3, 3);
    await popola(4, 4, 4); // R'lyeh (il pozzo al centro)
    await ferma();
    await foto('plancia_miniature');
    return controllaTesti('plancia con miniature');
  });

  await prova(`${vista.nome}: mano abbassata e alzata, carte giocabili illuminate`, async () => {
    await p.evaluate(() => { const c = window.__ct.ctrl; c.g.s.giocatori.find((g) => g.fazione === c.fazioneUmano).energia = 1; window.dispatchEvent(new Event('resize')); });
    await foto('mano_abbassata');
    await tap('mano:tutta');
    await foto('mano_alzata');
    const r1 = await controllaTesti('mano alzata');
    await tap('mano:tutta');
    return r1;
  });

  await prova(`${vista.nome}: pressione lunga su una carta della mano: scheda aperta, carta non selezionata ne' giocata`, async () => {
    const uid = await p.evaluate(() => window.__ct.ctrl.vista().mano.find((x) => window.__ct.ctrl.giocabile(x.uid))?.uid ?? window.__ct.ctrl.vista().mano[0].uid);
    const n0 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
    await premiArea(p, `mano:${uid}`);
    const aperta = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
    await p.waitForTimeout(700); // la scheda resta aperta anche dopo il rilascio
    const ancora = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
    await foto('pressione_lunga_mano');
    const sel = await p.evaluate(() => window.__ct.ctrl.selezione.carta);
    const n1 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
    await tap('grande:chiudi');
    const chiusa = await p.evaluate(() => !window.__ct.aree()['grande:chiudi']);
    return { ok: aperta && ancora && sel === undefined && n1 === n0 && chiusa, dettaglio: JSON.stringify({ aperta, ancora, sel, giocata: n1 - n0, chiusa }) };
  });

  await prova(`${vista.nome}: pressione lunga su una miniatura del tavolo e sulla carta di Lui`, async () => {
    const uids = await p.evaluate(() => window.__ct.ctrl.vista().territori[0].loro.map((x) => x.uid).concat(window.__ct.ctrl.vista().territori[0].mie.map((x) => x.uid)));
    for (const uid of [uids[0], uids[uids.length - 1]]) {
      await premiArea(p, `pres:${uid}`);
      const aperta = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
      const sel = await p.evaluate(() => window.__ct.ctrl.selezione.carta);
      if (uid === uids[0]) await foto('pressione_lunga_miniatura');
      if (!aperta || sel !== undefined) return { ok: false, dettaglio: `carta ${uid}: aperta=${aperta} sel=${sel}` };
      await tap('grande:chiudi');
    }
    return { ok: true, dettaglio: 'miniature di Lui e mia' };
  });

  await prova(`${vista.nome}: pressione breve = niente scheda; il tocco su una miniatura apre ancora la scheda`, async () => {
    const uid = await p.evaluate(() => window.__ct.ctrl.vista().territori[0].loro[0].uid);
    await pressioneTocco(p, ...(await p.evaluate((i) => { const a = window.__ct.aree()[i]; return [a.x + a.w / 2, a.y + a.h / 2]; }, `pres:${uid}`)), 150);
    await p.waitForTimeout(700);
    const aperta = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
    if (aperta) await tap('grande:chiudi');
    return { ok: aperta, dettaglio: `scheda dopo un tocco di 150 ms: ${aperta ? 'aperta (e' + "'" + ' il tocco normale)' : 'chiusa'}` };
  });

  for (const [n, nome, terr, nLoro, nMie] of [[2, 'due_carte', 1, 1, 1], [5, 'cinque_carte', 0, 3, 2], [8, 'otto_carte', 0, 4, 4], [5, 'cinque_carte_dunwich', 3, 3, 2], [8, 'otto_carte_rlyeh', 4, 4, 4]]) {
    await prova(`${vista.nome}: scena di un territorio con ${n} carte`, async () => {
      await p.evaluate(() => { window.__ct.ctrl.annulla(); });
      await popola(terr, nLoro, nMie);
      await ferma();
      await tap(`terr:${terr}`);
      await p.waitForTimeout(500);
      if ((await scena()) === null) return { ok: false, dettaglio: 'non e\' entrato nella scena' };
      await foto(`scena_${nome}`);
      const r = await controllaTesti(`scena con ${n} carte`);
      // pressione lunga su una carta della scena
      const uid = await p.evaluate((t) => window.__ct.ctrl.vista().territori[t].loro[0].uid, terr);
      await premiArea(p, `pres:${uid}`);
      const aperta = await p.evaluate(() => !!window.__ct.aree()['grande:chiudi']);
      const sel = await p.evaluate(() => window.__ct.ctrl.selezione.carta);
      if (n === 5) await foto('scena_pressione_lunga');
      if (aperta) await tap('grande:chiudi');
      await tap('scena:indietro');
      return { ok: r.ok && aperta && sel === undefined, dettaglio: `${r.dettaglio} | pressione lunga: aperta=${aperta} sel=${sel}` };
    });
  }

  await prova(`${vista.nome}: scena con carta selezionata e «Gioca una carta qui»`, async () => {
    await tap('mano:tutta');
    const uid = await p.evaluate(() => window.__ct.ctrl.vista().mano.find((x) => window.__ct.ctrl.giocabile(x.uid))?.uid);
    if (uid === undefined) return { ok: true, dettaglio: 'nessuna carta giocabile (salto)' };
    await tap(`mano:${uid}`);
    await foto('mano_carta_selezionata');
    const r1 = await controllaTesti('carta selezionata');
    await tap('btn:annulla');
    await tap('terr:1');
    await p.waitForTimeout(400);
    await tap('scena:gioca-qui').catch(() => undefined);
    await foto('scena_gioca_qui');
    const r2 = await controllaTesti('gioca qui');
    await p.touchscreen.tap(10, 10);
    await p.waitForTimeout(300);
    if ((await scena()) !== null) await tap('scena:indietro');
    return { ok: r1.ok && r2.ok, dettaglio: `${r1.dettaglio} | ${r2.dettaglio}` };
  });

  await ctx.close();
}

await browser.close();
let ko = 0;
for (const e of esiti) { if (!e.ok) ko++; console.log(`${e.ok ? 'OK ' : 'KO '} ${e.nome} - ${e.dettaglio}`); }
if (errori.length) { ko++; console.log('ERRORI DELLA PAGINA:', [...new Set(errori)].slice(0, 5)); }
console.log(ko ? `FINE: ${ko} problemi` : 'FINE: tutto ok');
process.exit(ko ? 1 : 0);
