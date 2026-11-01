// Avvio dell'interfaccia: schermata iniziale (DOM), scena PixiJS, turno del computer una mossa alla volta.
import { Application } from 'pixi.js';
import type { FazioneId } from '../dati/tipi.js';
import { sceglieMossa } from '../computer/computer.js';
import { Controller } from './controller.js';
import { datiDelBuild } from './dati-build.js';
import { caricaImmagini, caricaSfondo, numeroTexture } from './immagini.js';
import { caricaFont } from './tipografia.js';
import { segnaTutorialVisto, tutorialVisto } from './memoria.js';
import { SETTORI } from './config-plancia.js';
import { motivoCartaNonGiocabile, suggerimento } from './suggerimento.js';
import { disegnaAnteprima, disegnaScena, testiFuoriSchermo, type Area, type Azioni, type UiStato, type ZoomInfo } from './scena.js';

const parametri = new URLSearchParams(location.search);
const PAUSA = Number(parametri.get('pausa') ?? 650); // pausa fra le mosse del computer (ms)
const PAUSA_EVENTO = Number(parametri.get('pausaEvento') ?? 4500); // l'evento si chiude da solo dopo questo tempo

const ctrl = new Controller(datiDelBuild());
const ui: UiStato = { zoom: null, zoomTerr: null, grande: null, regole: false, ordine: [], copiato: '', suggerimentoNascosto: false, tutorial: null, toast: '', manoAlzata: false };
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
  return r;
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
    // prima della scena 3D (prossima PR): i territori in gioco mostrano la scheda, gli altri dicono che non sono ancora in gioco
    const terr = ctrl.cat.dati.territori.findIndex((t) => SETTORI.find((x) => x.id === id)?.territorioId === t.id);
    if (terr >= 0) { ui.grande = { tipo: 'terr', i: terr }; ridisegna(); return; }
    ui.toast = 'Non ancora in gioco';
    clearTimeout(timerToast);
    timerToast = window.setTimeout(() => { ui.toast = ''; ridisegna(); }, 3000);
    ridisegna();
  },
  chiudiEvento() {
    clearTimeout(timerEvento);
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
  ui.tutorial = null;
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
  await caricaFont();
  await Promise.all([caricaImmagini(), caricaSfondo()]);
  window.addEventListener('resize', ridisegna);
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
    zoomAttivo: () => !!ui.zoom || ui.zoomTerr !== null,
    immagini: () => numeroTexture(),
    suggerimento: () => suggerimento(ctrl.vista()),
    tutorialAttivo: () => ui.tutorial?.passo ?? -1,
    toast: () => ui.toast,
    occupato: () => ctrl.tocca_al_computer || !!ctrl.evento || ciclo,
    // la scena e' ferma: nessun ridisegno in coda e l'ultimo e' di almeno 120 ms fa
    stabile: () => !ridisegnoInCoda && performance.now() - ultimoDisegno > 120,
    avvia: (f: FazioneId, seme: number) => iniziaPartita(f, seme),
    // solo per i test: la mossa che il computer farebbe al posto del giocatore umano (poi la si esegue cliccando)
    suggerisci: () => sceglieMossa(ctrl.vista(), ctrl.cat),
  };
  const f = parametri.get('fazione');
  if (f === 'custodi' || f === 'risvegliati') iniziaPartita(f, Number(parametri.get('seme') ?? 1));
  else ridisegna();
}

void avvia();
