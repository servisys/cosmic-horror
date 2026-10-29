// Cattura automatica e verifica della schermata (PC e telefono). Richiede l'anteprima su http://localhost:4173
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.env.CT_URL ?? 'http://localhost:4173/';
const out = new URL('../../report/screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const formati = [
  { nome: 'pc-1280x800', viewport: { width: 1280, height: 800 }, mobile: false, dsf: 1 },
  { nome: 'telefono-390x844', viewport: { width: 390, height: 844 }, mobile: true, dsf: 3 },
  { nome: 'telefono-440x956', viewport: { width: 440, height: 956 }, mobile: true, dsf: 3 },
];

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fallimenti = 0;
for (const f of formati) {
  const ctx = await browser.newContext({ viewport: f.viewport, isMobile: f.mobile, hasTouch: f.mobile, deviceScaleFactor: f.dsf });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
  await page.goto(url);
  await page.waitForFunction(() => window.ct);
  const stato = () => page.evaluate(() => window.ct.stato());
  const verifica = (nome, ok) => { if (!ok) { fallimenti++; console.log(`  FALLITO: ${nome}`); } };

  await page.screenshot({ path: `${out}web-${f.nome}-1-iniziale.png` });
  verifica('stato iniziale', (await stato()).stato === 'neutro');

  // Clic reale sul pulsante della carta, usando le coordinate esposte dall'interfaccia.
  const r = await page.evaluate(() => window.ct.rects());
  const clic = async (id) => page.mouse.click(r[id].x + r[id].w / 2, r[id].y + r[id].h / 2);
  await clic('carta');
  await page.waitForTimeout(100);
  verifica('carta giocata con clic', (await stato()).stato === 'stato-uno');
  await page.screenshot({ path: `${out}web-${f.nome}-2-carta.png` });

  const r2 = await page.evaluate(() => window.ct.rects());
  await page.mouse.click(r2.fine_turno.x + r2.fine_turno.w / 2, r2.fine_turno.y + r2.fine_turno.h / 2);
  await page.waitForTimeout(100);
  verifica('avversario ha giocato', (await stato()).stato === 'stato-due');

  const r3 = await page.evaluate(() => window.ct.rects());
  await page.mouse.click(r3.fine_turno.x + r3.fine_turno.w / 2, r3.fine_turno.y + r3.fine_turno.h / 2);
  await page.waitForTimeout(100);
  const s = await stato();
  verifica('evento cosmico scattato', s.stato === 'stato-evento' && s.eventi_scattati.includes('E1'));
  await page.screenshot({ path: `${out}web-${f.nome}-3-evento.png` });

  verifica('nessun errore in console', errori.length === 0);
  if (errori.length) console.log('  errori:', errori.slice(0, 3));
  console.log(`${f.nome}: ${fallimenti === 0 ? 'OK' : 'con fallimenti'}`);
  await ctx.close();
}
await browser.close();
process.exit(fallimenti ? 1 : 0);
