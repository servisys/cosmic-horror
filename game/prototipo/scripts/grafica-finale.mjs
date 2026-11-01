// Screenshot della grafica finale a 956x440 (telefono orizzontale, tocco) e 1280x800: plancia con le due fazioni, mano alzata con una carta
// selezionata, schede grandi (carta dei Custodi, dei Risvegliati, evento cosmico), ingresso in un territorio e scorrimento (se presenti).
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/grafica-finale.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { premiArea } from './pressione.mjs';

import { indirizzoDiProva } from './server-prova.mjs';
const URL = await indirizzoDiProva(process.argv[2]);
const OUT = process.env.OUT ?? 'screenshot-grafica';
mkdirSync(OUT, { recursive: true });
const VISTE = [{ nome: '956x440', w: 956, h: 440, df: 2 }, { nome: '1280x800', w: 1280, h: 800, df: 1 }];
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const prova = async (nome, fn) => {
  try { const r = await fn(); esiti.push({ nome, ok: r.ok, dettaglio: r.dettaglio }); }
  catch (e) { esiti.push({ nome, ok: false, dettaglio: String(e).slice(0, 240) }); }
};
const errori = [];

for (const vista of VISTE) {
  const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h }, hasTouch: true, isMobile: true, deviceScaleFactor: vista.df });
  const apri = async (query) => {
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    p.on('pageerror', (e) => errori.push(e.message));
    await p.goto(URL + query);
    await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
    return p;
  };
  const ferma = (p) => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
  const tap = async (p, id) => {
    await ferma(p);
    const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
    if (!a) throw new Error('area ' + id + ' non trovata');
    await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
    await p.waitForTimeout(260);
  };
  const turno = async (p) => { for (let i = 0; i < 80 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150); await ferma(p); };
  const foto = async (p, nome) => { await ferma(p); await p.waitForTimeout(150); await p.screenshot({ path: `${OUT}/${vista.nome}_${nome}.png` }); };

  await prova(`${vista.nome}: plancia con i Custodi e con i Risvegliati`, async () => {
    for (const f of ['custodi', 'risvegliati']) {
      const p = await apri(`?fazione=${f}&seme=21&pausa=60&tutorial=0`);
      await turno(p);
      await foto(p, `plancia_${f}`);
      const fuori = await p.evaluate(() => window.__ct.fuori());
      await p.close();
      if (fuori.length) return { ok: false, dettaglio: 'testi fuori schermo: ' + fuori.join(', ') };
    }
    return { ok: true, dettaglio: 'due plance' };
  });

  await prova(`${vista.nome}: mano alzata con carta selezionata, schede grandi, evento`, async () => {
    const p = await apri('?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    await turno(p);
    // gioca qualche carta per avere le miniature sulla plancia
    let giocate = 0;
    for (let k = 0; k < 60 && giocate < 3; k++) {
      await turno(p);
      const m = await p.evaluate(() => window.__ct.suggerisci());
      if (m.t !== 'gioca') break;
      const n0 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      await tap(p, `mano:${m.carta}`);
      if (giocate === 0) await foto(p, 'mano_alzata_carta_selezionata');
      if (m.terr !== undefined) await tap(p, `terr:${m.terr}`);
      if (m.segno !== undefined) { await ferma(p); if (await p.evaluate(() => !!window.__ct.aree()['segno:piu'])) await tap(p, m.segno > 0 ? 'segno:piu' : 'segno:meno'); } // Pietra Incisa
      if (m.pres !== undefined) { await ferma(p); if (await p.evaluate((i) => !!window.__ct.aree()[i], `pres:${m.pres}`)) await tap(p, `pres:${m.pres}`); }
      if (m.cerca !== undefined) await tap(p, `cerca:${m.cerca}`);
      await ferma(p);
      if (await p.evaluate(() => !!window.__ct.aree()['btn:gioca'])) await tap(p, 'btn:gioca');
      if (await p.evaluate(() => !!window.__ct.ctrl.decisione)) await tap(p, 'btn:tieni');
      const n1 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      if (n1 > n0) giocate++;
    }
    await foto(p, 'plancia_con_miniature');
    const uid = await p.evaluate(() => window.__ct.ctrl.vista().mano[0].uid);
    await premiArea(p, `mano:${uid}`);
    await foto(p, 'scheda_carta_custodi');
    await tap(p, 'grande:chiudi');
    const loro = await p.evaluate(() => window.__ct.ctrl.vista().territori.flatMap((t) => t.loro.map((x) => x.uid))[0] ?? null);
    if (loro !== null) { await tap(p, `pres:${loro}`); await foto(p, 'scheda_carta_risvegliati'); await tap(p, 'grande:chiudi'); }
    await tap(p, 'terrnome:0');
    await foto(p, 'scheda_territorio');
    await tap(p, 'grande:chiudi');
    // evento cosmico: si gioca fino al primo evento
    let evento = false;
    for (let k = 0; k < 400 && !evento; k++) {
      const s = await p.evaluate(() => ({ ev: !!window.__ct.ctrl.evento, tuo: window.__ct.ctrl.tuoTurno, fine: window.__ct.ctrl.finita }));
      if (s.fine) break;
      if (s.ev) { evento = true; break; }
      if (!s.tuo) { await p.waitForTimeout(100); continue; }
      await tap(p, 'btn:fine');
    }
    if (evento) { await foto(p, 'evento_cosmico'); await tap(p, 'evento:chiudi'); }
    await p.close();
    return { ok: giocate >= 1 && evento, dettaglio: JSON.stringify({ giocate, evento }) };
  });

  await prova(`${vista.nome}: ingresso nei cinque luoghi, scorrimento, pizzico, «Gioca una carta qui»`, async () => {
    const p = await apri('?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    await turno(p);
    const scena = () => p.evaluate(() => window.__ct.scena());
    const ordine = ['innsmouth', 'biblioteca', 'dunwich', 'landa', 'rlyeh'];
    // 1. tocco sui cinque quadri della plancia: si entra nella scena giusta, indietro torna alla plancia
    const quadri = await p.evaluate(() => {
      const a = window.__ct.aree();
      return { innsmouth: 'terr:0', biblioteca: 'terr:1', landa: 'terr:2', dunwich: 'terr:3', rlyeh: 'terr:4' };
    });
    for (const id of ordine) {
      await tap(p, quadri[id]);
      await p.waitForTimeout(500);
      if ((await scena()) !== id) return { ok: false, dettaglio: `tocco su ${quadri[id]}: scena ${await scena()} invece di ${id}` };
      await foto(p, `scena_${id}`);
      const fuori = await p.evaluate(() => window.__ct.fuori());
      if (fuori.length) return { ok: false, dettaglio: `testi fuori schermo in ${id}: ${fuori.join(', ')}` };
      await tap(p, 'scena:indietro');
      if ((await scena()) !== null) return { ok: false, dettaglio: `indietro da ${id} non torna alla plancia` };
    }
    // 2. scorrimento con il dito (da destra a sinistra = luogo successivo, e viceversa)
    await tap(p, quadri.innsmouth);
    const scorri = async (da, a) => {
      await ferma(p);
      await p.mouse.move(da, vista.h * 0.6);
      await p.mouse.down();
      await p.mouse.move((da + a) / 2, vista.h * 0.6, { steps: 4 });
      await p.mouse.move(a, vista.h * 0.6, { steps: 4 });
      await p.mouse.up();
      await p.waitForTimeout(350);
    };
    await scorri(vista.w * 0.75, vista.w * 0.3);
    if ((await scena()) !== 'biblioteca') return { ok: false, dettaglio: `scorrimento a sinistra: scena ${await scena()}` };
    await scorri(vista.w * 0.75, vista.w * 0.3);
    await scorri(vista.w * 0.3, vista.w * 0.75);
    if ((await scena()) !== 'biblioteca') return { ok: false, dettaglio: `scorrimento avanti e indietro: scena ${await scena()}` };
    // frecce
    await tap(p, 'scena:vicino:1');
    if ((await scena()) !== 'dunwich') return { ok: false, dettaglio: `freccia avanti: scena ${await scena()}` };
    // 3. pizzico: due dita che si allargano tornano alla plancia
    await ferma(p);
    await p.evaluate(({ w, h }) => {
      const cv = document.querySelector('canvas');
      const r = cv.getBoundingClientRect();
      const ev = (tipo, id, x, y) => cv.dispatchEvent(new PointerEvent(tipo, { pointerId: id, pointerType: 'touch', clientX: r.left + x, clientY: r.top + y, bubbles: true, isPrimary: id === 1 }));
      ev('pointerdown', 1, w * 0.45, h * 0.5); ev('pointerdown', 2, w * 0.55, h * 0.5);
      for (let k = 1; k <= 6; k++) { ev('pointermove', 1, w * (0.45 - k * 0.04), h * 0.5); ev('pointermove', 2, w * (0.55 + k * 0.04), h * 0.5); }
      ev('pointerup', 1, w * 0.2, h * 0.5); ev('pointerup', 2, w * 0.8, h * 0.5);
    }, { w: vista.w, h: vista.h });
    await p.waitForTimeout(300);
    if ((await scena()) !== null) return { ok: false, dettaglio: `pizzico: scena ${await scena()}` };
    // 4. «Gioca una carta qui»: si apre la mano con le sole carte valide e la carta si gioca
    let giocata = false;
    for (let k = 0; k < 80 && !giocata; k++) {
      await turno(p);
      const m = await p.evaluate(() => window.__ct.suggerisci());
      if (m.t !== 'gioca' || m.terr === undefined) { await tap(p, 'btn:fine'); continue; }
      const id = ['innsmouth', 'biblioteca', 'landa', 'dunwich', 'rlyeh'][m.terr];
      await tap(p, `terr:${m.terr}`); // nessuna carta scelta: entra nella scena
      if ((await scena()) !== id) return { ok: false, dettaglio: `scena ${await scena()} invece di ${id}` };
      const n0 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      await tap(p, 'scena:gioca-qui');
      await foto(p, 'scena_mano_qui');
      const validi = await p.evaluate((t) => window.__ct.ctrl.carteGiocabiliIn(t), m.terr);
      if (!validi.length) return { ok: false, dettaglio: 'nessuna carta valida in un territorio dove il computer ne giocherebbe una' };
      await tap(p, `mano:${validi[0]}`);
      await ferma(p);
      if (await p.evaluate(() => !!window.__ct.aree()['btn:gioca'])) await tap(p, 'btn:gioca');
      await foto(p, 'scena_dopo_carta');
      const n1 = await p.evaluate(() => window.__ct.ctrl.g.s.registro.length);
      giocata = n1 > n0;
      if (!giocata) {
        const dbg = await p.evaluate(() => ({ sel: window.__ct.ctrl.selezione, opz: window.__ct.ctrl.opzioni() }));
        return { ok: false, dettaglio: 'la carta scelta dalla scena non è stata giocata ' + JSON.stringify(dbg) };
      }
      await tap(p, 'scena:indietro');
    }
    await p.close();
    return { ok: giocata, dettaglio: 'cinque scene, scorrimento, frecce, pizzico, carta giocata dalla scena' };
  });
  await ctx.close();
}
await browser.close();
if (errori.length) esiti.push({ nome: 'nessun errore in console', ok: false, dettaglio: errori.slice(0, 3).join(' | ') });
else esiti.push({ nome: 'nessun errore in console', ok: true, dettaglio: '' });
for (const e of esiti) console.log(e.ok ? 'OK  ' : 'KO  ', e.nome, '-', e.dettaglio);
process.exit(esiti.every((e) => e.ok) ? 0 : 1);
