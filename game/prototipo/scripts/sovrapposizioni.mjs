// Sovrapposizioni sulla plancia (5 quadri: Innsmouth, Biblioteca, Dunwich, Landa e il pozzo di R'lyeh con la targhetta «ULTIMA TAPPA»): per ogni quadro attivo, alle tre misure del telefono (956x440, 844x390, 740x340), con 0, 3 e 6 carte per lato
// e il bottone Sigillo/rito acceso (forzato solo per la prova), nessun rettangolo toccabile del quadro (targhetta, bottone, miniature) deve
// intersecare Fine turno, icone, consiglio, energia e mano abbassata, ne' uscire dallo schermo. Screenshot della Landa col bottone acceso.
// Uso: CT_CHROMIUM=<chrome> OUT=<cartella> node scripts/sovrapposizioni.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

import { indirizzoDiProva } from './server-prova.mjs';
const URL = await indirizzoDiProva(process.argv[2]);
const OUT = process.env.OUT ?? 'screenshot-sovrapposizioni';
mkdirSync(OUT, { recursive: true });
const VISTE = [{ nome: '956x440', w: 956, h: 440 }, { nome: '844x390', w: 844, h: 390 }, { nome: '740x340', w: 740, h: 340 }];
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const errori = [];
const interseca = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;

for (const vista of VISTE) {
  for (const fazione of ['custodi', 'risvegliati']) {
    const ctx = await browser.newContext({ viewport: { width: vista.w, height: vista.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
    p.on('pageerror', (e) => errori.push(e.message));
    await p.goto(URL + `?fazione=${fazione}&seme=21&pausa=60&pausaEvento=60000&tutorial=0`);
    await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
    for (let i = 0; i < 80 && !(await p.evaluate(() => window.__ct.ctrl.tuoTurno)); i++) await p.waitForTimeout(150);
    const ferma = () => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
    await ferma();
    // bottone acceso (solo per la prova) e n carte per lato in tutti e cinque i territori
    const prepara = (n) => p.evaluate((n) => {
      const c = window.__ct.ctrl;
      c.puoTappa = () => true;
      const mio = c.g.s.giocatori.findIndex((g) => g.fazione === c.fazioneUmano);
      const pres = [...c.cat.carte.values()].filter((x) => x.tipo === 'presenza').map((x) => x.id);
      const dei = (pref) => pres.filter((id) => id.startsWith(pref));
      const fm = c.fazioneUmano === 'custodi' ? 'CU' : 'RI';
      const fl = fm === 'CU' ? 'RI' : 'CU';
      c.g.s.territori.forEach((ter, t) => {
        ter.presenze[0].length = 0;
        ter.presenze[1].length = 0;
        for (let k = 0; k < n; k++) {
          ter.presenze[mio].push({ uid: 9000 + t * 20 + k, carta: { uid: 9000 + t * 20 + k, id: dei(fm)[k % dei(fm).length], trasformata: false }, bonus: 0 });
          ter.presenze[1 - mio].push({ uid: 9500 + t * 20 + k, carta: { uid: 9500 + t * 20 + k, id: dei(fl)[k % dei(fl).length], trasformata: false }, bonus: 0 });
        }
      });
      window.dispatchEvent(new Event('resize'));
    }, n);
    for (const n of [0, 3, 6]) {
      await prepara(n);
      await ferma();
      const m = await p.evaluate(() => window.__ct.misure());
      const problemi = [];
      const sch = { x: 0, y: 0, w: vista.w, h: vista.h };
      for (const q of m.quadri) {
        if (q.r.x < -0.5 || q.r.y < -0.5 || q.r.x + q.r.w > vista.w + 0.5 || q.r.y + q.r.h > vista.h + 0.5) problemi.push(`${q.nome} esce dallo schermo`);
        for (const f of m.fissi) if (interseca(q.r, f.r)) problemi.push(`${q.nome} interseca ${f.nome}`);
      }
      const bottoni = m.quadri.filter((q) => q.nome.startsWith('bottone:')).length;
      if (bottoni !== 5) problemi.push(`bottoni accesi ${bottoni} invece di 5`);
      // i bottoni non devono essere coperti da altri quadri (targhette, miniature di un altro territorio)
      for (const b of m.quadri.filter((q) => q.nome.startsWith('bottone:'))) {
        for (const q of m.quadri) if (q !== b && !q.nome.endsWith(':' + b.nome.split(':')[1]) && interseca(b.r, q.r) && q.nome.startsWith('miniatura')) problemi.push(`${b.nome} coperto da ${q.nome}`);
      }
      const pic = await p.evaluate(() => window.__ct.piccoli());
      if (pic.length) problemi.push('testi sotto soglia: ' + JSON.stringify(pic.slice(0, 3)));
      esiti.push({ nome: `${vista.nome} ${fazione} ${n} carte per lato`, ok: problemi.length === 0, dettaglio: problemi.length ? [...new Set(problemi)].slice(0, 6).join('; ') : `${m.quadri.length} rettangoli dei quadri, ${m.fissi.length} fissi` });
      if (n === 3) { await p.waitForTimeout(150); await p.screenshot({ path: `${OUT}/${vista.nome}_landa_${fazione === 'custodi' ? 'sigillo' : 'rito'}_acceso.png` }); }
    }
    await ctx.close();
  }
}
await browser.close();
let ko = 0;
for (const e of esiti) { if (!e.ok) ko++; console.log(`${e.ok ? 'OK ' : 'KO '} ${e.nome} - ${e.dettaglio}`); }
if (errori.length) { ko++; console.log('ERRORI DELLA PAGINA:', [...new Set(errori)].slice(0, 5)); }
console.log(ko ? `FINE: ${ko} problemi` : 'FINE: tutto ok');
process.exit(ko ? 1 : 0);
