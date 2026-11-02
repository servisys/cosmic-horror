// CT-FIX-007: barra di stato in basso e ritorno dal background. Telefono in orizzontale (852x393): la barra c'e', sta dentro lo schermo e non copre Dunwich;
// poi si simula il ritorno dal background (lo schermo cambia misura senza evento «resize», poi arrivano visibilitychange / pageshow / visualViewport.resize)
// e il canvas deve tornare grande quanto il contenitore. Il tutto schermo (API Fullscreen) non c'e' su iPhone: nessun errore.
// Uso: CT_CHROMIUM=<chrome> node scripts/verifica-schermo.mjs [url]
import { chromium } from 'playwright';
import { indirizzoDiProva } from './server-prova.mjs';

const URL = await indirizzoDiProva(process.argv[2]);
const browser = await chromium.launch({
  executablePath: process.env.CT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const esiti = [];
const errori = [];
const prova = (nome, ok, dettaglio = '') => esiti.push({ nome, ok, dettaglio });

const ctx = await browser.newContext({ viewport: { width: 852, height: 393 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
const p = await ctx.newPage();
p.on('pageerror', (e) => errori.push(e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errori.push(m.text()); });
await p.goto(URL + '?fazione=custodi&seme=21&pausa=60&pausaEvento=60000&tutorial=0');
await p.waitForFunction(() => window.__ct && window.__ct.ctrl.g);
const ferma = () => p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
await ferma();

// 1. barra di stato
let m = await p.evaluate(() => window.__ct.misure());
const barra = m.fissi.find((f) => f.nome === 'energia');
prova('barra di stato presente in basso', !!barra && Math.abs(barra.r.y + barra.r.h - 393) < 1, JSON.stringify(barra?.r));
prova('barra dentro lo schermo', !!barra && barra.r.x >= -0.5 && barra.r.x + barra.r.w <= 852.5 && barra.r.y >= 0, '');
const sopra = m.fissi.filter((f) => f.nome !== 'mano' && f.nome !== 'consiglio' && f.r.x < 200 && f.r.y > 200);
prova('niente riquadro fisso nell\'angolo in basso a sinistra sopra la barra', sopra.every((f) => f.nome === 'energia'), JSON.stringify(sopra.map((f) => f.nome)));

// 2. ritorno dal background: lo schermo cambia misura senza che arrivi «resize» (iOS), poi arrivano gli eventi del ritorno
const misuraCanvas = () => p.evaluate(() => {
  const c = document.querySelector('#gioco canvas');
  const g = document.getElementById('gioco').getBoundingClientRect();
  return { cw: Math.round(c.getBoundingClientRect().width), ch: Math.round(c.getBoundingClientRect().height), gw: Math.round(g.width), gh: Math.round(g.height) };
});
await p.setViewportSize({ width: 700, height: 300 });
await p.evaluate(() => {
  // blocca il «resize» spontaneo: si vuole provare che il ritorno da solo basta a rimettere tutto a posto
  window.addEventListener('resize', (e) => e.stopImmediatePropagation(), true);
});
await p.setViewportSize({ width: 852, height: 393 });
let mc = await misuraCanvas();
const ritorno = async () => {
  await p.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pageshow'));
    window.visualViewport?.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('orientationchange'));
  });
  await p.waitForTimeout(1600);
  await ferma();
};
await ritorno();
mc = await misuraCanvas();
prova('dopo il ritorno il canvas ha la misura del contenitore', mc.cw === mc.gw && mc.ch === mc.gh, JSON.stringify(mc));
m = await p.evaluate(() => window.__ct.misure());
const barra2 = m.fissi.find((f) => f.nome === 'energia');
prova('dopo il ritorno la barra e\' ancora sul fondo', !!barra2 && Math.abs(barra2.r.y + barra2.r.h - mc.gh) < 1, JSON.stringify(barra2?.r));
const fuori = await p.evaluate(() => window.__ct.fuori());
prova('nessun testo fuori schermo dopo il ritorno', fuori.length === 0, JSON.stringify(fuori.slice(0, 3)));

// 3. cambio di misura vero (rotazione/ritorno con altra altezza): il canvas segue
await p.setViewportSize({ width: 740, height: 340 });
await ritorno();
mc = await misuraCanvas();
prova('con altra misura il canvas segue il contenitore', mc.cw === 740 && mc.ch === 340 && mc.cw === mc.gw && mc.ch === mc.gh, JSON.stringify(mc));

// 4. niente errori (su iPhone requestFullscreen non esiste: non deve dare errori)
await p.evaluate(() => { try { Object.defineProperty(document.documentElement, 'requestFullscreen', { value: undefined, configurable: true }); } catch { /* niente */ } });
await p.touchscreen.tap(400, 200);
await p.waitForTimeout(300);
prova('nessun errore nella pagina', errori.length === 0, errori.slice(0, 3).join(' | '));

await browser.close();
let ko = 0;
for (const e of esiti) { if (!e.ok) ko++; console.log(`${e.ok ? 'OK ' : 'KO '} ${e.nome}${e.dettaglio ? ' - ' + e.dettaglio : ''}`); }
console.log(ko ? `FINE: ${ko} problemi` : 'FINE: tutto ok');
process.exit(ko ? 1 : 0);
