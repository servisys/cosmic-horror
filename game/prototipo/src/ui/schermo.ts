// Schermo del telefono: dopo il ritorno dal background (iOS e Android) la scena puo' restare con le misure vecchie o zoomata.
// Qui si ridimensiona e si ridisegna a ogni evento che puo' cambiare lo schermo (e di nuovo dopo un attimo, a layout assestato),
// si blocca lo zoom a pizzico e a doppio tocco e si riporta la scala a 1. Niente di questo cambia le regole.
import type { Application } from 'pixi.js';

const RITARDI = [0, 150, 500, 1200]; // ms: il layout del telefono si assesta qualche istante dopo il ritorno
const VIEWPORT = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

/** Best effort: se la pagina e' ingrandita (iOS ignora user-scalable=no) si riporta la scala a 1 riscrivendo il meta viewport. */
function azzeraZoom(): void {
  const vv = window.visualViewport;
  if (!vv || Math.abs(vv.scale - 1) < 0.01) return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1.0001, viewport-fit=cover';
  window.scrollTo(0, 0);
  setTimeout(() => { meta.content = VIEWPORT; }, 100);
}

/** Ridimensiona il canvas sul contenitore e ridisegna: subito e ancora dopo qualche istante. */
export function sorvegliaSchermo(app: Application, ridisegna: () => void): void {
  let timer: number[] = [];
  const adatta = (): void => {
    azzeraZoom();
    try { app.resize(); } catch { /* il renderer non e' pronto: si riprova al prossimo evento */ }
    ridisegna();
  };
  const rimandato = (): void => {
    timer.forEach((t) => clearTimeout(t));
    timer = RITARDI.map((ms) => window.setTimeout(adatta, ms));
  };
  window.addEventListener('resize', rimandato);
  window.addEventListener('orientationchange', rimandato);
  window.addEventListener('pageshow', rimandato);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') rimandato(); });
  document.addEventListener('fullscreenchange', rimandato);
  window.visualViewport?.addEventListener('resize', rimandato);
  // il pizzico (Safari) non deve ingrandire la pagina: il gioco ha i suoi gesti
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
}
