// Verifica delle animazioni a 956x440 (tocco) e 1280x800: partono (contatori in window.__ct.animazioni()), finiscono, non bloccano il gioco,
// e con «riduci movimento» (o ?animazioni=0) non parte nulla e tutto e' immediato. Screenshot a meta' animazione.
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/verifica-animazioni.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://127.0.0.1:5183/';
const OUT = process.env.OUT ?? 'screenshot-animazioni';
mkdirSync(OUT, { recursive: true });
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

async function apri(ctx, query) {
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL + query);
  await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
  return p;
}
const ferma = (p) => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
const tap = async (p, id) => {
  await ferma(p);
  const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
  if (!a) throw new Error('area ' + id + ' non trovata');
  await p.touchscreen.tap(a.x + a.w / 2, a.y + a.h / 2);
};
const anim = (p) => p.evaluate(() => window.__ct.animazioni());
const turno = async (p) => { for (let i = 0; i < 80 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150); await ferma(p); };

for (const vista of [{ nome: '956x440', w: 956, h: 440, df: 2 }, { nome: '1280x800', w: 1280, h: 800, df: 1 }]) {
  const nuovo = (opz = {}) => browser.newContext({ viewport: { width: vista.w, height: vista.h }, hasTouch: true, isMobile: true, deviceScaleFactor: vista.df, ...opz });

  await prova(`${vista.nome}: ingresso e uscita con animazione (200 + 300 ms), tocchi bloccati solo durante la transizione`, async () => {
    const ctx = await nuovo();
    const p = await apri(ctx, '?fazione=custodi&seme=21&pausa=60&tutorial=0');
    await turno(p);
    const prima = await anim(p);
    if (prima.ridotto) return { ok: false, dettaglio: 'animazioni ridotte senza averlo chiesto' };
    await tap(p, 'terr:1');
    await p.waitForTimeout(120);
    const durante = await anim(p);
    await p.screenshot({ path: `${OUT}/${vista.nome}_transizione_entrata.png` });
    if (durante.attive < 1) return { ok: false, dettaglio: 'nessuna transizione bloccante dopo il tocco sul quadro' };
    const t0 = Date.now();
    await p.waitForFunction(() => window.__ct.animazioni().attive === 0, null, { timeout: 3000 });
    const durata = Date.now() - t0 + 120;
    if ((await p.evaluate(() => window.__ct.scena())) !== 'biblioteca') return { ok: false, dettaglio: 'non siamo nella scena della Biblioteca' };
    await tap(p, 'scena:indietro');
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}/${vista.nome}_transizione_uscita.png` });
    await p.waitForFunction(() => window.__ct.animazioni().attive === 0, null, { timeout: 3000 });
    const dopo = await anim(p);
    await ctx.close();
    return { ok: dopo.transizioni === prima.transizioni + 2 && durata < 900, dettaglio: JSON.stringify({ transizioni: dopo.transizioni - prima.transizioni, durataMs: durata }) };
  });

  await prova(`${vista.nome}: carta che vola, rimbalzo, pop dei numeri, lampo, turno ed evento`, async () => {
    const ctx = await nuovo();
    const p = await apri(ctx, '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
    let fotoEvento = false;
    // chiude l'evento cosmico se c'e' (con foto a meta' della comparsa e della scomparsa)
    const evento = async () => {
      if (!(await p.evaluate(() => !!window.__ct.ctrl.evento))) return false;
      if (!fotoEvento) {
        await p.waitForTimeout(150);
        await p.screenshot({ path: `${OUT}/${vista.nome}_evento_che_compare.png` });
      }
      await tap(p, 'evento:chiudi');
      if (!fotoEvento) {
        await p.waitForTimeout(110);
        await p.screenshot({ path: `${OUT}/${vista.nome}_evento_che_sparisce.png` });
        fotoEvento = true;
      }
      return true;
    };
    let giocata = false;
    let foto = { turno: false, lampo: false };
    for (let k = 0; k < 500 && !(giocata && fotoEvento && foto.lampo); k++) {
      const s = await p.evaluate(() => ({ fine: window.__ct.ctrl.finita, tuo: window.__ct.ctrl.tuoTurno, dec: !!window.__ct.ctrl.decisione }));
      if (s.fine) break;
      if (await evento()) continue;
      if (s.dec) { await tap(p, 'btn:tieni'); continue; }
      if (!s.tuo) { await p.waitForTimeout(120); continue; }
      await ferma(p);
      if (!foto.turno) { await p.screenshot({ path: `${OUT}/${vista.nome}_scritta_turno.png` }); foto.turno = true; }
      const m = await p.evaluate(() => window.__ct.suggerisci());
      if (m.t === 'gioca') {
        const n0 = await p.evaluate(() => window.__ct.ctrl.vista().territori.reduce((a, t) => a + t.mie.length, 0));
        await tap(p, `mano:${m.carta}`);
        await p.waitForTimeout(80);
        if (m.terr !== undefined) await tap(p, `terr:${m.terr}`);
        if (m.pres !== undefined) { await ferma(p); if (await p.evaluate((i) => !!window.__ct.aree()[i], `pres:${m.pres}`)) await tap(p, `pres:${m.pres}`); }
        if (m.cerca !== undefined) await tap(p, `cerca:${m.cerca}`);
        await ferma(p);
        if (await p.evaluate(() => !!window.__ct.aree()['btn:gioca'])) await tap(p, 'btn:gioca');
        await p.waitForTimeout(150);
        if (!giocata) await p.screenshot({ path: `${OUT}/${vista.nome}_carta_che_vola.png` });
        const n1 = await p.evaluate(() => window.__ct.ctrl.vista().territori.reduce((a, t) => a + t.mie.length, 0));
        if (n1 > n0) giocata = true;
        continue;
      }
      if (m.t === 'tappa') {
        await tap(p, `btn:tappa:${m.terr}`);
        await p.waitForTimeout(120);
        if (!foto.lampo) { await p.screenshot({ path: `${OUT}/${vista.nome}_lampo_sigillo.png` }); foto.lampo = true; }
        continue;
      }
      await tap(p, m.t === 'riduci' ? 'btn:riduci' : 'btn:fine');
      await p.waitForTimeout(250);
    }
    await ferma(p);
    const c = await anim(p);
    await ctx.close();
    const ok = giocata && c.voli >= 1 && c.rimbalzi >= 1 && c.pop >= 1 && c.banner >= 2 && c.evento >= 1 && c.lampi >= 1;
    return { ok, dettaglio: JSON.stringify({ giocata, voli: c.voli, rimbalzi: c.rimbalzi, pop: c.pop, lampi: c.lampi, banner: c.banner, evento: c.evento }) };
  });

  for (const [nome, opz, query] of [['con «riduci movimento» del sistema', { reducedMotion: 'reduce' }, ''], ['con ?animazioni=0', {}, '&animazioni=0']]) {
    await prova(`${vista.nome}: ${nome} non parte nessuna animazione e tutto e' immediato`, async () => {
      const ctx = await nuovo(opz);
      const p = await apri(ctx, `?fazione=risvegliati&seme=22&pausa=60&pausaEvento=60000&tutorial=0${query}`);
      await turno(p);
      const a0 = await anim(p);
      if (!a0.ridotto) return { ok: false, dettaglio: 'le animazioni non risultano ridotte' };
      await tap(p, 'terr:0');
      await p.waitForTimeout(100);
      const dentro = await p.evaluate(() => window.__ct.scena());
      const a1 = await anim(p);
      await tap(p, 'scena:indietro');
      await p.waitForTimeout(100);
      const fuori = await p.evaluate(() => window.__ct.scena());
      await ctx.close();
      const tot = Object.entries(a1).filter(([k]) => !['ridotto', 'attive'].includes(k)).reduce((s, [, v]) => s + v, 0);
      return { ok: dentro === 'innsmouth' && fuori === null && a1.attive === 0 && tot === 0, dettaglio: JSON.stringify({ dentro, fuori, attive: a1.attive, animazioniPartite: tot }) };
    });
  }
}
await browser.close();
if (errori.length) esiti.push({ nome: 'nessun errore in console', ok: false, dettaglio: errori.slice(0, 3).join(' | ') });
else esiti.push({ nome: 'nessun errore in console', ok: true, dettaglio: '' });
for (const e of esiti) console.log(e.ok ? 'OK  ' : 'KO  ', e.nome, '-', e.dettaglio);
process.exit(esiti.every((e) => e.ok) ? 0 : 1);
