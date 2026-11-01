// Screenshot della grafica finale a 956x440 (telefono orizzontale, tocco) e 1280x800: plancia con le due fazioni, mano alzata con una carta
// selezionata, schede grandi (carta dei Custodi, dei Risvegliati, evento cosmico), ingresso in un territorio e scorrimento (se presenti).
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/grafica-finale.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://127.0.0.1:5183/';
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
    await tap(p, `lente:${uid}`);
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
  await ctx.close();
}
await browser.close();
if (errori.length) esiti.push({ nome: 'nessun errore in console', ok: false, dettaglio: errori.slice(0, 3).join(' | ') });
else esiti.push({ nome: 'nessun errore in console', ok: true, dettaglio: '' });
for (const e of esiti) console.log(e.ok ? 'OK  ' : 'KO  ', e.nome, '-', e.dettaglio);
process.exit(esiti.every((e) => e.ok) ? 0 : 1);
