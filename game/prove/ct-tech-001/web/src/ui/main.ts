// Presentazione della fetta CT-TECH-001 (PixiJS 2D + three.js per un solo elemento 3D).
// FIXTURE TECNICA NON DI DESIGN. La logica e' in ../logic/game.ts.
import { Application, Container, Graphics, Text } from 'pixi.js';
import * as THREE from 'three';
import fixtureJson from '../../../fixture/fixture.json';
import { carteInMano, creaGioco, fineTurno, giocaCarta, type Fixture, type Gioco } from '../logic/game';

let gioco: Gioco = creaGioco(fixtureJson as unknown as Fixture);
let app: Application;
let ui: Container;
const rects: Record<string, { x: number; y: number; w: number; h: number }> = {};

const colori = { sfondo: 0x0b0b14, pannello: 0x171727, bordo: 0x3a3a5c, testo: 0xe8e8f0, accento: 0x8f6bd8, evento: 0xd8704a };

function testo(s: string, size: number, wrap = 0, fill: number = colori.testo): Text {
  return new Text({ text: s, style: { fill, fontSize: size, fontFamily: 'system-ui, sans-serif', wordWrap: wrap > 0, wordWrapWidth: wrap } });
}

function bottone(etichetta: string, x: number, y: number, w: number, h: number, id: string, azione: () => void, attivo = true): Container {
  const c = new Container();
  const g = new Graphics().roundRect(x, y, w, h, 10).fill(attivo ? colori.accento : colori.bordo);
  const t = testo(etichetta, Math.min(20, h * 0.4));
  t.x = x + (w - t.width) / 2;
  t.y = y + (h - t.height) / 2;
  c.addChild(g, t);
  if (attivo) {
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.on('pointertap', azione);
  }
  rects[id] = { x, y, w, h };
  return c;
}

function disegna(): void {
  const w = app.screen.width;
  const h = app.screen.height;
  const verticale = w < 700;
  ui?.destroy({ children: true });
  ui = new Container();
  app.stage.addChild(ui);

  const m = verticale ? 12 : 24;
  const terr = verticale ? { x: m, y: m, w: w - 2 * m, h: h * 0.34 } : { x: m, y: m, w: w * 0.58, h: h - 2 * m };
  const ctrl = verticale
    ? { x: m, y: terr.y + terr.h + m, w: w - 2 * m, h: h * 0.2 }
    : { x: terr.x + terr.w + m, y: m, w: w - terr.w - 3 * m, h: h * 0.4 };
  const reg = verticale
    ? { x: m, y: ctrl.y + ctrl.h + m, w: w - 2 * m, h: h - (ctrl.y + ctrl.h + 2 * m) }
    : { x: ctrl.x, y: ctrl.y + ctrl.h + m, w: ctrl.w, h: h - (ctrl.y + ctrl.h + 2 * m) };
  rects.territorio = terr;

  ui.addChild(new Graphics().roundRect(terr.x, terr.y, terr.w, terr.h, 14).fill(colori.pannello).stroke({ color: colori.bordo, width: 2 }));
  const titolo = testo('Territorio T1', verticale ? 18 : 26);
  titolo.x = terr.x + 16;
  titolo.y = terr.y + 12;
  const stato = testo(`Stato: ${gioco.stato}`, verticale ? 24 : 40, terr.w - 32, colori.accento);
  stato.x = terr.x + 16;
  stato.y = terr.y + terr.h * 0.38;
  const stato2 = testo(`Secondo stato: ${gioco.stato2}`, verticale ? 16 : 22, terr.w - 32);
  stato2.x = terr.x + 16;
  stato2.y = stato.y + stato.height + 8;
  const round = testo(`Round ${gioco.round}`, verticale ? 16 : 20);
  round.x = terr.x + 16;
  round.y = terr.y + terr.h - (verticale ? 34 : 44);
  ui.addChild(titolo, stato, stato2, round);

  if (gioco.eventiScattati.length > 0) {
    const ev = testo(`Evento cosmico: ${gioco.eventiScattati.join(', ')}`, verticale ? 14 : 20, terr.w - 32, colori.evento);
    ev.x = terr.x + 16;
    ev.y = stato2.y + stato2.height + 12;
    ui.addChild(ev);
  }

  const mano = carteInMano(gioco);
  const bw = ctrl.w;
  const bh = Math.min(64, ctrl.h / 2 - 6);
  ui.addChild(
    bottone(mano.length ? `Gioca carta ${mano[0].id}` : 'Nessuna carta in mano', ctrl.x, ctrl.y, bw, bh, 'carta', () => {
      if (carteInMano(gioco).length) aggiorna(giocaCarta(gioco, carteInMano(gioco)[0].id));
    }, mano.length > 0),
    bottone('Fine turno', ctrl.x, ctrl.y + bh + 12, bw, bh, 'fine_turno', () => aggiorna(fineTurno(gioco))),
  );

  ui.addChild(new Graphics().roundRect(reg.x, reg.y, reg.w, reg.h, 10).fill(0x10101c).stroke({ color: colori.bordo, width: 1 }));
  const ultime = gioco.log.slice(-6).join('\n');
  const log = testo(ultime, verticale ? 12 : 14, reg.w - 20);
  log.x = reg.x + 10;
  log.y = reg.y + 8;
  ui.addChild(log);

  posizionaTre(terr, verticale);
}

// Un solo elemento 3D minimo, dentro la scheda del territorio.
const contenitoreTre = document.getElementById('three') as HTMLDivElement;
const scena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
camera.position.z = 3;
const oggetto = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshNormalMaterial());
scena.add(oggetto);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
contenitoreTre.appendChild(renderer.domElement);

function posizionaTre(terr: { x: number; y: number; w: number; h: number }, verticale: boolean): void {
  const lato = verticale ? 80 : 140;
  contenitoreTre.style.left = `${terr.x + terr.w - lato - 14}px`;
  contenitoreTre.style.top = `${terr.y + 14}px`;
  renderer.setSize(lato, lato);
  rects.tre = { x: terr.x + terr.w - lato - 14, y: terr.y + 14, w: lato, h: lato };
}

function aggiorna(nuovo: Gioco): void {
  gioco = nuovo;
  disegna();
}

async function avvia(): Promise<void> {
  app = new Application();
  await app.init({ background: colori.sfondo, resizeTo: window, antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true });
  document.body.appendChild(app.canvas);
  window.addEventListener('resize', disegna);
  disegna();
  app.ticker.add(() => {
    oggetto.rotation.y += 0.01;
    oggetto.rotation.x += 0.004;
    renderer.render(scena, camera);
  });
  // Interfaccia per i test automatici (non fa parte del gioco).
  (window as unknown as Record<string, unknown>).ct = {
    stato: () => ({ stato: gioco.stato, stato2: gioco.stato2, round: gioco.round, eventi_scattati: gioco.eventiScattati }),
    gioca: (id: string) => aggiorna(giocaCarta(gioco, id)),
    fineTurno: () => aggiorna(fineTurno(gioco)),
    reset: () => aggiorna(creaGioco(fixtureJson as unknown as Fixture)),
    rects: () => rects,
  };
}

void avvia();
