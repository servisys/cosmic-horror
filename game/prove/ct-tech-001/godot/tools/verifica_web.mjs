// Verifica automatica dell'export web di Godot in Chromium (cattura + clic reali). Uso: node tools/verifica_web.mjs <url> <prefisso-file>
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, prefisso] = process.argv.slice(2);
const formati = [
  { nome: 'pc-1280x800', w: 1280, h: 800, mobile: false, dsf: 1, carta: [0.79, 0.048], fine: [0.79, 0.126] },
  { nome: 'telefono-440x956', w: 440, h: 956, mobile: true, dsf: 3, carta: [0.5, 0.62], fine: [0.5, 0.70] },
];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let fallimenti = 0;
for (const f of formati) {
  const ctx = await browser.newContext({ viewport: { width: f.w, height: f.h }, isMobile: f.mobile, hasTouch: f.mobile, deviceScaleFactor: f.dsf });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
  await page.goto(url);
  await page.waitForSelector('canvas', { timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${prefisso}-${f.nome}-1-iniziale.png` });
  await page.mouse.click(f.w * f.carta[0], f.h * f.carta[1]);
  await page.waitForTimeout(500);
  await page.mouse.click(f.w * f.fine[0], f.h * f.fine[1]);
  await page.waitForTimeout(500);
  await page.mouse.click(f.w * f.fine[0], f.h * f.fine[1]);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${prefisso}-${f.nome}-3-evento.png` });
  if (errori.length) { fallimenti++; console.log(`${f.nome}: errori`, errori.slice(0, 3)); } else console.log(`${f.nome}: nessun errore in console`);
  await ctx.close();
}
await browser.close();
process.exit(fallimenti ? 1 : 0);
