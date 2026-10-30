// Cattura automatica del concept. Richiede l'anteprima su http://localhost:4174
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/home/user/cosmic-horror/game/prove/ct-tech-001/web/package.json');
const { chromium } = require('playwright');
const url = process.env.CT_URL ?? 'http://localhost:4174/';
const out = new URL('../report/screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const formati = [
  { nome: 'telefono-orizzontale-956x440', w: 956, h: 440, dsf: 2 },
  { nome: 'telefono-verticale-440x956', w: 440, h: 956, dsf: 2 },
  { nome: 'pc-1280x800', w: 1280, h: 800, dsf: 1 },
];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let ko = 0;
for (const f of formati) {
  const ctx = await browser.newContext({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: f.dsf, hasTouch: true, isMobile: f.w < 700 || f.h < 500 });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errori.push(m.text()));
  await page.goto(url);
  await page.waitForFunction(() => window.ct && window.ct.frame() > 5, null, { timeout: 30000 });
  await page.evaluate(() => window.ct.tempo(0.9));
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}${f.nome}-1-entrata.png` });
  await page.evaluate(() => window.ct.tempo(5));
  await page.evaluate(() => window.ct.fermaTilt(-0.7, 0.3));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}${f.nome}-2-inclinata-sinistra.png` });
  await page.evaluate(() => window.ct.fermaTilt(0.7, -0.3));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}${f.nome}-3-inclinata-destra.png` });
  // Confronto tra tutte le carte dell'elenco (se ce n'e' piu' di una).
  if ((await page.evaluate(() => window.ct.carte())) > 1) {
    await page.evaluate(() => window.ct.modo('confronto'));
    await page.evaluate(() => window.ct.tempo(5));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}${f.nome}-4-confronto.png` });
  }
  console.log(`${f.nome}: ${errori.length ? 'ERRORI ' + errori.slice(0, 2) : 'nessun errore'}`);
  if (errori.length) ko++;
  await ctx.close();
}
await browser.close();
process.exit(ko ? 1 : 0);
