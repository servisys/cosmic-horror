// Avvio dell'interfaccia: schermata iniziale (DOM), scena PixiJS, turno del computer una mossa alla volta.
import { Application } from 'pixi.js';
import type { FazioneId } from '../dati/tipi.js';
import { sceglieMossa } from '../computer/computer.js';
import { Controller } from './controller.js';
import { datiDelBuild } from './dati-build.js';
import { disegnaScena, testiFuoriSchermo, type Area, type Azioni, type UiStato, type ZoomInfo } from './scena.js';

const parametri = new URLSearchParams(location.search);
const PAUSA = Number(parametri.get('pausa') ?? 650); // pausa fra le mosse del computer (ms)
const PAUSA_EVENTO = Number(parametri.get('pausaEvento') ?? 4500); // l'evento si chiude da solo dopo questo tempo

const ctrl = new Controller(datiDelBuild());
const ui: UiStato = { zoom: null, zoomTerr: null, regole: false, ordine: [], copiato: '' };
let app: Application;
let aree: Record<string, Area> = {};
let ridisegnoInCoda = false;
let ciclo = false;
let mosseComputer = 0; // mosse del computer giocate (per i test)
let timerEvento: number | undefined;

function ridisegna(): void {
  if (!app || ridisegnoInCoda) return;
  ridisegnoInCoda = true;
  setTimeout(() => {
    ridisegnoInCoda = false;
    aree = disegnaScena(app, ctrl, ui, azioni);
    void avviaCicloSeServe();
  }, 0);
}

const dormi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function avviaCicloSeServe(): Promise<void> {
  if (ciclo || !ctrl.tocca_al_computer) return;
  ciclo = true;
  try {
    while (ctrl.tocca_al_computer) {
      // se c'e' un evento cosmico da leggere, il gioco aspetta (si chiude toccando o dopo qualche secondo)
      while (ctrl.evento) await dormi(60);
      await dormi(PAUSA);
      if (!ctrl.tocca_al_computer) break;
      ctrl.passoComputer();
      mosseComputer++;
      aree = disegnaScena(app, ctrl, ui, azioni);
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
    ridisegna();
  },
  zoomTerritorio(t) {
    ui.zoomTerr = t;
    ridisegna();
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
  ui.ordine = [];
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
  window.addEventListener('resize', ridisegna);
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
    ctrl,
    mosseComputer: () => mosseComputer,
    fuori: () => testiFuoriSchermo(),
    occupato: () => ctrl.tocca_al_computer || !!ctrl.evento || ciclo,
    avvia: (f: FazioneId, seme: number) => iniziaPartita(f, seme),
    // solo per i test: la mossa che il computer farebbe al posto del giocatore umano (poi la si esegue cliccando)
    suggerisci: () => sceglieMossa(ctrl.vista(), ctrl.cat),
  };
  const f = parametri.get('fazione');
  if (f === 'custodi' || f === 'risvegliati') iniziaPartita(f, Number(parametri.get('seme') ?? 1));
  else ridisegna();
}

void avvia();
