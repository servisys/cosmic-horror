// Avvio dell'interfaccia: schermata iniziale (DOM), scena PixiJS, turno del computer una mossa alla volta.
import { Application } from 'pixi.js';
import type { FazioneId } from '../dati/tipi.js';
import { sceglieMossa } from '../computer/computer.js';
import { Controller } from './controller.js';
import { datiDelBuild } from './dati-build.js';
import { alCaricarsiDiUnaScena, caricaImmagini, caricaScene, caricaSfondo, numeroTexture } from './immagini.js';
import { caricaFont } from './tipografia.js';
import { VERSIONE, caricaAmbiente, etichettaVersione } from './versione.js';
import { registraServiceWorker, tuttoSchermoAlPrimoTocco } from './pwa.js';
import { segnaTutorialVisto, tutorialVisto } from './memoria.js';
import { anim, type FotoStato } from './animazioni.js';
import { SETTORI, inSchermo } from './config-plancia.js';
import { motivoCartaNonGiocabile, suggerimento } from './suggerimento.js';
import { disegnaAnteprima, disegnaScena, puntiUltimoDisegno, testiFuoriSchermo, misureUltimoDisegno, testiPiccoli, type Area, type Azioni, type UiStato, type ZoomInfo } from './scena.js';

const parametri = new URLSearchParams(location.search);
const PAUSA = Number(parametri.get('pausa') ?? 650); // pausa fra le mosse del computer (ms)
const PAUSA_EVENTO = Number(parametri.get('pausaEvento') ?? 4500); // l'evento si chiude da solo dopo questo tempo

const ctrl = new Controller(datiDelBuild());
const ui: UiStato = { zoom: null, zoomTerr: null, grande: null, regole: false, ordine: [], copiato: '', suggerimentoNascosto: false, tutorial: null, toast: '', manoAlzata: false, scena: null, manoQui: false, pietre: false };
// Tutorial: parte alla prima partita (o se richiesto dal bottone «Come si gioca»), al primo turno del giocatore
let tutorialPendente = false;
let tutorialRichiesto = false;
let timerToast: number | undefined;
let app: Application;
let aree: Record<string, Area> = {};
let ridisegnoInCoda = false;
let ciclo = false;
let mosseComputer = 0; // mosse del computer giocate (per i test)
let timerEvento: number | undefined;
let ultimoDisegno = 0;
let ultimoPuntatore: { x: number; y: number } | null = null;

function controllaIngrandimento(): void {
  if ((!ui.zoom && ui.zoomTerr === null) || !ultimoPuntatore) return;
  const sotto = app.renderer.events.rootBoundary.hitTest(ultimoPuntatore.x, ultimoPuntatore.y);
  if (!sotto || sotto.label !== 'zoomable') {
    ui.zoom = null;
    ui.zoomTerr = null;
    disegnaAnteprima(app, ctrl, ui);
  }
}

/** Ridisegna la scena e ricorda quando (i test automatici aspettano che la scena sia ferma prima di toccare). */
function disegna(): Record<string, Area> {
  const r = disegnaScena(app, ctrl, ui, azioni);
  ultimoDisegno = performance.now();
  const W = app.screen.width;
  const H = app.screen.height;
  const v = ctrl.vista();
  anim.dopoDisegno(fotoStato(r), r, puntiUltimoDisegno(), W, H, Math.max(0.7, Math.min(W / 956, H / 440)), !!ctrl.evento, ctrl.finita, v.fazione, v.fazioneAvv);
  return r;
}

/** Cio' che serve alle animazioni per capire cosa e' cambiato fra un disegno e il successivo. */
function fotoStato(a: Record<string, Area>): FotoStato {
  const v = ctrl.vista();
  const presenze: FotoStato['presenze'] = new Map();
  const tappe = new Set<string>();
  v.territori.forEach((t, i) => {
    for (const p of t.mie) presenze.set(p.uid, { terr: i, mio: true, id: p.id, trasformata: p.trasformata });
    for (const p of t.loro) presenze.set(p.uid, { terr: i, mio: false, id: p.id, trasformata: p.trasformata });
    if (t.mioTappa) tappe.add(`${i}:mio`);
    if (t.loroTappa) tappe.add(`${i}:loro`);
  });
  const mano: FotoStato['mano'] = new Map();
  for (const cd of v.mano) {
    const r = a[`mano:${cd.uid}`];
    if (r) mano.set(cd.uid, { id: cd.id, x: r.x + r.w / 2, y: r.y + r.h / 2 });
  }
  return { presenze, mano, tappe, tuo: ctrl.tuoTurno, evento: !!ctrl.evento };
}

/** Centro dello schermo del quadro di un settore (per l'avvicinamento nelle transizioni). */
function centroSettore(id: string | null): { cx: number; cy: number } {
  const W = app.screen.width;
  const H = app.screen.height;
  const st = SETTORI.find((x) => x.id === id);
  if (!st) return { cx: W / 2, cy: H / 2 };
  const r = inSchermo(st.zona, W, H);
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
}

function ridisegna(): void {
  if (!app || !ctrl.attiva || ridisegnoInCoda) return;
  ridisegnoInCoda = true;
  setTimeout(() => {
    ridisegnoInCoda = false;
    if (tutorialPendente && !ui.tutorial && ctrl.tuoTurno && !ctrl.decisione && !ctrl.evento && !ctrl.finita) {
      tutorialPendente = false;
      ui.tutorial = { passo: 0 };
    }
    aree = disegna();
    void avviaCicloSeServe();
    setTimeout(controllaIngrandimento, 40);
  }, 0);
}

const dormi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function avviaCicloSeServe(): Promise<void> {
  if (ciclo || !ctrl.tocca_al_computer) return;
  ciclo = true;
  try {
    while (ctrl.tocca_al_computer) {
      // se c'e' un evento cosmico da leggere, il gioco aspetta (si chiude toccando o dopo qualche secondo)
      while (ctrl.evento || ui.tutorial) await dormi(60);
      await dormi(PAUSA);
      if (!ctrl.tocca_al_computer) break;
      ctrl.passoComputer();
      mosseComputer++;
      aree = disegna();
      if (ctrl.evento) {
        clearTimeout(timerEvento);
        timerEvento = window.setTimeout(() => azioni.chiudiEvento(), PAUSA_EVENTO);
      }
    }
  } finally {
    ciclo = false;
  }
  ridisegna();
}

const azioni: Azioni = {
  rerender: ridisegna,
  zoom(z: ZoomInfo | null) {
    ui.zoom = z;
    disegnaAnteprima(app, ctrl, ui);
  },
  grande(g) {
    ui.grande = g;
    ui.zoom = null;
    ui.zoomTerr = null;
    ridisegna();
  },
  zoomTerritorio(t) {
    ui.zoomTerr = t;
    disegnaAnteprima(app, ctrl, ui);
  },
  async copia() {
    const testo = ctrl.registroTesto();
    try {
      await navigator.clipboard.writeText(testo);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = testo;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* niente da fare */ }
      ta.remove();
    }
    (window as unknown as { __registroCopiato: string }).__registroCopiato = testo;
    ui.copiato = 'Registro copiato!';
    ridisegna();
    setTimeout(() => { ui.copiato = ''; ridisegna(); }, 2000);
  },
  nuova() {
    mostraInizio();
  },
  regole(aperte) {
    ui.regole = aperte;
    ridisegna();
  },
  suggerimento() {
    ui.suggerimentoNascosto = !ui.suggerimentoNascosto;
    ui.toast = '';
    ridisegna();
  },
  tutorial(azione) {
    if (!ui.tutorial) return;
    if (azione === 'avanti' && ui.tutorial.passo < 5) ui.tutorial = { passo: ui.tutorial.passo + 1 };
    else {
      ui.tutorial = null;
      segnaTutorialVisto();
    }
    ridisegna();
  },
  motivo(uid) {
    const carta = ctrl.vista().mano.find((x) => x.uid === uid);
    if (!carta) return;
    ui.toast = motivoCartaNonGiocabile(ctrl.vista(), carta);
    clearTimeout(timerToast);
    timerToast = window.setTimeout(() => { ui.toast = ''; ridisegna(); }, 3500);
    ridisegna();
  },
  alzaMano() {
    ui.manoAlzata = !ui.manoAlzata;
    ridisegna();
  },
  settore(id) {
    // un quadro (o il pozzo di R'lyeh) toccato senza una carta da giocare: si entra nella sua scena 3D
    const c0 = centroSettore(id);
    anim.entra(c0.cx, c0.cy, app.screen.width, app.screen.height);
    ui.scena = id;
    ui.manoQui = false;
    ui.zoom = null;
    ui.zoomTerr = null;
    ridisegna();
  },
  pietre(aperto) {
    ui.pietre = aperto;
    ridisegna();
  },
  esci() {
    const c0 = centroSettore(ui.scena);
    anim.esce(c0.cx, c0.cy, app.screen.width, app.screen.height);
    ui.scena = null;
    ui.manoQui = false;
    ui.toast = '';
    ridisegna();
  },
  vicino(dir) {
    if (!ui.scena) return;
    const k = SETTORI.findIndex((x) => x.id === ui.scena) + dir;
    if (k < 0 || k >= SETTORI.length) return;
    anim.scorre(dir, app.screen.width, app.screen.height);
    ui.scena = SETTORI[k].id;
    ui.manoQui = false;
    ui.toast = '';
    ctrl.annulla();
    ridisegna();
  },
  manoQui(aperta) {
    ui.manoQui = aperta;
    ridisegna();
  },
  giocaQui(uid) {
    const st = SETTORI.find((x) => x.id === ui.scena);
    const i = ctrl.cat.dati.territori.findIndex((t) => t.id === st?.territorioId);
    ui.manoQui = false;
    ctrl.scegliCarta(uid);
    if (i >= 0 && ctrl.opzioni().terr.includes(i)) ctrl.scegliTerritorio(i);
    ridisegna();
  },
  chiudiEvento() {
    clearTimeout(timerEvento);
    anim.dissolviGruppo('evento', app.screen.width, app.screen.height);
    anim.gruppoChiuso('evento');
    ctrl.chiudiEvento();
    ridisegna();
  },
  ordine(uid) {
    const dec = ctrl.decisione;
    if (!dec) return;
    if (uid === 'azzera') ui.ordine = [];
    else if (uid === 'tieni') {
      ctrl.riordina(dec.uids);
      ui.ordine = [];
    } else if (!ui.ordine.includes(uid)) {
      ui.ordine.push(uid);
      if (ui.ordine.length === dec.uids.length - 1) ui.ordine.push(dec.uids.find((x) => !ui.ordine.includes(x))!);
      if (ui.ordine.length === dec.uids.length) {
        ctrl.riordina([...ui.ordine]);
        ui.ordine = [];
      }
    }
    ridisegna();
  },
};

/** Scorrere (a destra o a sinistra) passa al luogo vicino; allargare con due dita torna alla plancia. */
function gesti(): void {
  const punti = new Map<number, { x: number; y: number }>();
  let inizio: { x: number; y: number } | null = null;
  let dist0 = 0;
  let pizzicato = false;
  const dist = (): number => {
    const [a, b] = [...punti.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  app.canvas.addEventListener('pointerdown', (e) => {
    punti.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (punti.size === 1) { inizio = { x: e.offsetX, y: e.offsetY }; pizzicato = false; }
    if (punti.size === 2) dist0 = dist();
  });
  app.canvas.addEventListener('pointermove', (e) => {
    if (!punti.has(e.pointerId)) return;
    punti.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (punti.size === 2 && ui.scena && !pizzicato && dist0 > 0 && dist() > dist0 * 1.35) {
      pizzicato = true;
      azioni.esci();
    }
  });
  const fine = (e: PointerEvent): void => {
    if (!punti.has(e.pointerId)) return;
    const solo = punti.size === 1;
    punti.delete(e.pointerId);
    if (solo && inizio && ui.scena && !pizzicato) {
      const dx = e.offsetX - inizio.x;
      const dy = e.offsetY - inizio.y;
      const u = Math.max(0.7, Math.min(app.screen.width / 956, app.screen.height / 440));
      if (Math.abs(dx) > 70 * u && Math.abs(dy) < 60 * u) azioni.vicino(dx < 0 ? 1 : -1);
    }
    if (!punti.size) inizio = null;
  };
  app.canvas.addEventListener('pointerup', fine);
  app.canvas.addEventListener('pointercancel', fine);
}

function mostraInizio(): void {
  document.getElementById('inizio')!.style.display = 'flex';
}

function iniziaPartita(fazione: FazioneId, seme: number): void {
  document.getElementById('inizio')!.style.display = 'none';
  ui.zoom = null;
  ui.zoomTerr = null;
  ui.regole = false;
  ui.grande = null;
  ui.ordine = [];
  ui.toast = '';
  ui.manoAlzata = false;
  ui.scena = null;
  ui.manoQui = false;
  ui.pietre = false;
  ui.tutorial = null;
  anim.azzera();
  tutorialPendente = parametri.get('tutorial') === '0' ? false : tutorialRichiesto || parametri.get('tutorial') === '1' || !tutorialVisto();
  ctrl.nuova(fazione, seme);
  ridisegna();
}

async function avvia(): Promise<void> {
  app = new Application();
  await app.init({
    resizeTo: document.getElementById('gioco')!, background: 0x0d1015, antialias: true,
    resolution: Math.max(1, window.devicePixelRatio || 1), autoDensity: true,
  });
  document.getElementById('gioco')!.appendChild(app.canvas);
  // tenere premuto su una carta la apre in grande: niente menu del browser, selezione del testo o scorrimento della pagina
  app.canvas.style.touchAction = 'none';
  app.canvas.style.userSelect = 'none';
  app.canvas.style.setProperty('-webkit-user-select', 'none');
  app.canvas.style.setProperty('-webkit-touch-callout', 'none');
  app.canvas.style.setProperty('-webkit-tap-highlight-color', 'transparent');
  app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  await caricaFont();
  await Promise.all([caricaImmagini(), caricaSfondo()]);
  window.addEventListener('resize', ridisegna);
  // scene 3D dei luoghi: si caricano in background dopo la partenza (poche centinaia di KB), la scena si ridisegna quando arrivano
  alCaricarsiDiUnaScena(() => { if (ui.scena) ridisegna(); });
  void caricaScene(SETTORI.map((x) => x.scena));
  const elVersione = document.getElementById('versione');
  if (elVersione) elVersione.textContent = 'Versione: ' + VERSIONE;
  // l'ambiente (prova / produzione) arriva da versione.json: si aggiunge appena letto
  void caricaAmbiente().then(() => { if (elVersione) elVersione.textContent = 'Versione: ' + etichettaVersione(); });
  gesti();
  tuttoSchermoAlPrimoTocco();
  registraServiceWorker(() => ctrl.attiva && !ctrl.finita);
  anim.suFine = ridisegna;
  // La scena si ricostruisce a ogni cambiamento: l'oggetto sotto il puntatore sparisce senza mandare «pointerout».
  // Si tiene l'ultima posizione del puntatore e, dopo ogni ridisegno, si toglie l'ingrandimento al passaggio se sotto non c'e' piu' una carta.
  app.canvas.addEventListener('pointermove', (e) => {
    ultimoPuntatore = { x: e.offsetX, y: e.offsetY };
    if (ui.zoom || ui.zoomTerr !== null) setTimeout(controllaIngrandimento, 40);
  });
  const bottoneTutorial = document.getElementById('come-si-gioca') as HTMLButtonElement | null;
  bottoneTutorial?.addEventListener('click', () => {
    tutorialRichiesto = !tutorialRichiesto;
    bottoneTutorial.classList.toggle('attivo', tutorialRichiesto);
    const nota = document.getElementById('nota-tutorial');
    if (nota) nota.textContent = tutorialRichiesto ? 'Scegli la fazione: la partita parte con la spiegazione passo per passo.' : '';
  });
  document.querySelectorAll<HTMLButtonElement>('#inizio button[data-fazione]').forEach((b) =>
    b.addEventListener('click', () => {
      const raw = (document.getElementById('seme') as HTMLInputElement).value.trim();
      const seme = raw ? Math.abs(Math.floor(Number(raw))) || 1 : Math.floor(Math.random() * 1e9);
      iniziaPartita(b.dataset.fazione as FazioneId, seme);
    }),
  );
  // collegamenti per i test automatici (non fanno parte del gioco)
  (window as unknown as Record<string, unknown>).__ct = {
    aree: () => aree,
    sotto: (x: number, y: number) => { const rb = app.renderer.events.rootBoundary; rb.rootTarget ??= app.stage; const o = rb.hitTest(x, y); if (!o) return null; const b = o.getBounds(); return `${o.constructor.name}:${o.label ?? ''}@${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)},${Math.round(b.height)}`; },
    ctrl,
    mosseComputer: () => mosseComputer,
    fuori: () => testiFuoriSchermo(),
    versione: () => VERSIONE,
    piccoli: () => testiPiccoli(),
    misure: () => misureUltimoDisegno(),
    zoomAttivo: () => !!ui.zoom || ui.zoomTerr !== null,
    immagini: () => numeroTexture(),
    suggerimento: () => suggerimento(ctrl.vista()),
    tutorialAttivo: () => ui.tutorial?.passo ?? -1,
    toast: () => ui.toast,
    occupato: () => ctrl.tocca_al_computer || !!ctrl.evento || ciclo,
    // la scena e' ferma: nessun ridisegno in coda e l'ultimo e' di almeno 120 ms fa
    scena: () => ui.scena,
    stabile: () => !ridisegnoInCoda && performance.now() - ultimoDisegno > 120 && anim.attive() === 0,
    animazioni: () => ({ ridotto: anim.ridotto, attive: anim.attive(), ...anim.conteggi }),
    avvia: (f: FazioneId, seme: number) => iniziaPartita(f, seme),
    // solo per i test: la mossa che il computer farebbe al posto del giocatore umano (poi la si esegue cliccando)
    suggerisci: () => sceglieMossa(ctrl.vista(), ctrl.cat),
  };
  const f = parametri.get('fazione');
  if (f === 'custodi' || f === 'risvegliati') iniziaPartita(f, Number(parametri.get('seme') ?? 1));
  else ridisegna();
}

void avvia();
