// Disegno della plancia con PixiJS: sfondo 3D a tutto schermo, targhette dei territori, mano di carte, energia e fine turno.
// Nessuna regola qui: tutto cio' che si mostra viene dalla vista del giocatore, tutto cio' che si puo' fare viene dal controller (che chiede al motore).
import { Container, Graphics, Rectangle, Sprite, Text, type Application } from 'pixi.js';
import { carta } from '../motore/catalogo.js';
import type { Vista, VistaPresenza, VistaTerritorio } from '../motore/vista.js';
import { altezzaCarta, cartaGrande, cartaRidotta, datiDaCarta, datiEvento, datiTerritorio, type DatiCarta, tavolozza } from './carte.js';
import { IMG_H, IMG_W, SETTORI, coverTrasformazione, inSchermo, settoreDelTerritorio, type Settore } from './config-plancia.js';
import type { Controller } from './controller.js';
import { COL, colori, Disegno, texturaGradiente, type Area } from './disegno.js';
import { idImmagine, texturaSfondo } from './immagini.js';
import { disegnaTerritorio } from './scena-territorio.js';
import { motivoTappa, passiTutorial, suggerimento } from './suggerimento.js';

export type { Area } from './disegno.js';

export interface ZoomInfo {
  id: string;
  trasformata: boolean;
}

export interface UiStato {
  zoom: ZoomInfo | null;
  zoomTerr: number | null;
  /** Vista grande (tocco su una carta o su un territorio). */
  grande: { tipo: 'carta'; id: string; trasformata: boolean } | { tipo: 'terr'; i: number } | null;
  regole: boolean;
  ordine: number[];
  copiato: string;
  /** La riga di suggerimento e' nascosta (un tocco la mostra/nasconde). */
  suggerimentoNascosto: boolean;
  /** Tutorial in corso: indice del passo. */
  tutorial: { passo: number } | null;
  /** Messaggio breve (per esempio perche' una carta non si puo' giocare). */
  toast: string;
  /** La mano e' alzata (un tocco sulla zona della mano la alza o la abbassa; con una carta selezionata e' sempre alzata). */
  manoAlzata: boolean;
  /** Dentro la scena 3D di un luogo (id del settore), o sulla plancia (null). */
  scena: Settore['id'] | null;
  /** Nella scena: e' aperta la scelta della carta da giocare li'. */
  manoQui: boolean;
}

export interface Azioni {
  rerender(): void;
  zoom(z: ZoomInfo | null): void;
  zoomTerritorio(t: number | null): void;
  grande(g: UiStato['grande']): void;
  copia(): void;
  nuova(): void;
  regole(aperte: boolean): void;
  chiudiEvento(): void;
  suggerimento(): void;
  tutorial(azione: 'avanti' | 'salta'): void;
  motivo(uid: number): void;
  ordine(uid: number | 'tieni' | 'azzera'): void;
  alzaMano(): void;
  /** Tocco su un quadro della plancia che non gioca la carta selezionata. */
  settore(id: Settore['id']): void;
  esci(): void;
  vicino(dir: -1 | 1): void;
  manoQui(aperta: boolean): void;
  giocaQui(uid: number): void;
}

export const NOME_FAZ: Record<string, string> = { custodi: 'I Custodi', risvegliati: 'I Risvegliati' };
const COL_FAZ: Record<string, number> = { custodi: 0x9cc4f5, risvegliati: 0xa9dcb6 };
export const NOME_TIPO_EVENTO: Record<string, string> = {
  territorio: 'colpirà un territorio', giocatore: 'colpirà un giocatore', campo: 'colpirà tutto il campo', carte: 'riguarda le carte', '?': '?',
};

export function disegnaScena(app: Application, c: Controller, ui: UiStato, az: Azioni): Record<string, Area> {
  const W = app.screen.width;
  const H = app.screen.height;
  const u = Math.max(0.7, Math.min(W / 956, H / 440));
  const { radice: s, sopra } = livelli(app);
  for (const ch of s.removeChildren()) ch.destroy({ children: true });
  void sopra;
  const d = new Disegno(s, u);
  const v: Vista = c.vista();
  const opz = c.opzioni();
  const sel = c.selezione;
  const hBar = 30 * u;

  if (ui.scena) {
    disegnaTerritorio(d, c, ui, az, W, H);
  } else {
    d.rett(0, 0, W, H, COL.sfondo, { r: 0 });
    sfondo(d, W, H);

    // ---------- quadri della plancia ----------
    const terrDelSettore = (st: Settore): number => (st.territorioId ? c.cat.dati.territori.findIndex((t) => t.id === st.territorioId) : -1);
    const visibili = new Map<string, Area>();
    for (const st of SETTORI) visibili.set(st.id, inSchermo(st.zona, W, H));
    for (const st of SETTORI) {
      const i = terrDelSettore(st);
      const vis = visibili.get(st.id)!;
      const reg: Area = { x: 0, y: 0, w: 28 * u, h: 18 * u }; // provvisorio: il punto libero si sceglie a fine disegno
      if (st.id === 'rlyeh') {
        pozzo(d, st, vis, reg, az);
        continue;
      }
      const valido = i >= 0 && opz.terr.includes(i);
      if (i < 0) {
        // quadro non in gioco: leggermente scurito (senza coprire il pozzo)
        const pz = visibili.get('rlyeh')!;
        const passo = Math.max(2, 3 * u);
        for (let yy = vis.y; yy < vis.y + vis.h; yy += passo) {
          const hh = Math.min(passo, vis.y + vis.h - yy);
          const dy = (yy + hh / 2 - (pz.y + pz.h / 2)) / (pz.h / 2);
          if (Math.abs(dy) >= 1) { d.rett(vis.x, yy, vis.w, hh + 0.5, 0x000000, { alpha: 0.36, r: 0 }); continue; }
          const dx = (pz.w / 2) * Math.sqrt(1 - dy * dy);
          const sx = pz.x + pz.w / 2 - dx;
          const dxr = pz.x + pz.w / 2 + dx;
          if (sx > vis.x) d.rett(vis.x, yy, Math.min(sx, vis.x + vis.w) - vis.x, hh + 0.5, 0x000000, { alpha: 0.36, r: 0 });
          if (dxr < vis.x + vis.w) d.rett(Math.max(dxr, vis.x), yy, vis.x + vis.w - Math.max(dxr, vis.x), hh + 0.5, 0x000000, { alpha: 0.36, r: 0 });
        }
      }
      d.rett(vis.x, vis.y, vis.w, vis.h, 0xffffff, {
        alpha: 0.001, r: 0, tap: () => { if (i >= 0 && c.opzioni().terr.includes(i)) { c.scegliTerritorio(i); az.rerender(); } else az.settore(st.id); },
      });
      if (i >= 0) d.aree[`terr:${i}`] = reg;
      else d.aree[`settore:${st.id}`] = reg;
      if (valido) glowQuadro(d, vis);
    }

    // ---------- targhette, miniature, bottoni ----------
    const cAvv = colori(v.fazioneAvv === 'custodi' ? 'CU' : 'RI');
    const ostacoli: Area[] = [{ x: 0, y: 0, w: W, h: hBar }];
    v.territori.forEach((t, i) => {
      const st = settoreDelTerritorio(c.cat.dati.territori[i].id);
      if (!st) return;
      ostacoli.push(targhetta(d, c, ui, az, v, t, i, st, visibili.get(st.id)!, opz, hBar, W));
    });
    d.aree['territori:tutti'] = { x: 0, y: hBar, w: W, h: H - hBar - 58 * u };

    // ---------- barra in alto: avversario, messaggio, giro ----------
    barraAlto(d, c, v, W, hBar, cAvv.chiaro);

    // ---------- segnale di vittoria ----------
    let yTop = hBar + 4 * u;
    if (v.segnaleMio || v.segnaleAvv) {
      const mio = v.segnaleMio;
      const txt = mio ? 'SEGNALE: sei a una sola tappa dalla vittoria. L\'avversario ha il suo turno di avviso.' : `SEGNALE: ${NOME_FAZ[v.fazioneAvv]} sono a una sola tappa dalla vittoria! Hai un turno per fermarli.`;
      const w = Math.min(W - 24 * u, d.larghezza(txt, 12, { bold: true }) + 24 * u);
      d.rett((W - w) / 2, yTop, w, 20 * u, mio ? 0x1f3a22 : 0x5a1f1a, { stroke: mio ? COL.valido : COL.pericolo, r: 10 * u, alpha: 0.94 });
      d.testo(txt, W / 2, yTop + 10 * u, 12, 0xffffff, { bold: true, anchorX: 0.5, anchorY: 0.5 }).y = yTop + 10 * u;
      yTop += 24 * u;
    }

    // ---------- mano ----------
    const mano = disegnaMano(d, c, ui, az, v, sel, W, H);
    ostacoli.push(mano.zona);

    // ---------- riga di suggerimento (sopra la mano) ----------
    {
      const sug = c.tuoTurno && !c.decisione && !c.finita ? suggerimento(v) : null;
      const nascosta = ui.suggerimentoNascosto && !ui.toast;
      const hS = (nascosta ? 15 : 24) * u;
      const testoS = ui.toast || (sug ? sug.testo : c.finita ? '' : c.tuoTurno ? '' : 'Turno di Lui: aspetta, poi tocca a te.');
      const urgente = !ui.toast && sug?.tipo === 'avversario-un-passo';
      const wS = Math.min(470 * u, W - 330 * u);
      const xS = (W - wS) / 2;
      const yS = mano.yAlto - hS - 6 * u;
      ostacoli.push({ x: xS, y: H - 118 * u - 10 * u - hS - 6 * u - 12 * u, w: wS, h: hS + 24 * u });
      d.rett(xS, yS, wS, hS, ui.toast ? 0x3a2a14 : urgente ? 0x4a1f1a : 0x0e1a26, {
        stroke: ui.toast ? COL.oro : urgente ? COL.pericolo : 0x3f78b5, id: 'suggerimento', tap: () => az.suggerimento(), r: hS / 2, alpha: 0.92,
      });
      if (nascosta) d.testo('Consiglio nascosto: tocca per mostrarlo', W / 2, yS + hS / 2, 10.5, COL.tenue, { anchorX: 0.5, anchorY: 0.5 }).y = yS + hS / 2;
      else if (testoS) {
        d.testo(ui.toast ? '!' : 'Consiglio:', xS + 10 * u, yS + hS / 2, 11, COL.oroChiaro, { titoli: true, bold: true, anchorY: 0.5 }).y = yS + hS / 2;
        d.adatta(testoS, xS + (ui.toast ? 24 : 76) * u, yS + 2 * u, wS - (ui.toast ? 34 : 86) * u, hS - 4 * u, 12.5, 10, 0xffffff, false, 'left');
      }
    }

    // ---------- energia, fine turno, regole e registro ----------
    ostacoli.push(...controlli(d, c, ui, az, v, sel, opz, W, H));
    puntiLiberi(d, c, visibili, ostacoli, terrDelSettore);


  }

  // ---------- sovrapposizioni ----------
  const modale = opz.cerca.length > 0 || !!c.decisione || !!c.evento || ui.regole || c.finita || !!ui.grande;
  if (opz.cerca.length) sceltaCerca(d, c, opz.cerca, W, H, az);
  const dec = c.decisione;
  if (dec) riordinoBiblioteca(d, c, dec.uids, ui, W, H, az);
  if (ui.grande && !c.evento) vistaGrande(d, c, ui.grande, W, H, az);
  if (c.evento) eventoCosmico(d, c, W, H, az);
  if (ui.regole) pannelloRegole(d, W, H, az);
  if (c.finita) fineAPartita(d, c, W, H, az);
  if (ui.tutorial && !c.finita) tutorialSovrapposto(d, passiTutorial(v.fazione)[ui.tutorial.passo], ui.tutorial.passo, W, H, az);
  disegnaAnteprima(app, c, ui);
  fuori = s.children
    .filter((x): x is Text => x instanceof Text)
    .filter((x) => {
      const b = x.getBounds();
      return b.x < -1 || b.y < -1 || b.x + b.width > W + 1 || b.y + b.height > H + 1;
    })
    .map((x) => x.text);
  return d.aree;
}

// La scena si ricostruisce a ogni cambiamento; l'anteprima al passaggio del mouse sta in un livello a parte (sopra, senza eventi),
// cosi' mostrarla o toglierla non ricostruisce la scena (e non fa perdere un clic in corso).
let livelloScena: Container | undefined;
let livelloAnteprima: Container | undefined;
function livelli(app: Application): { radice: Container; sopra: Container } {
  if (!livelloScena || livelloScena.destroyed) {
    livelloScena = new Container();
    livelloAnteprima = new Container();
    livelloAnteprima.eventMode = 'none';
    app.stage.addChild(livelloScena, livelloAnteprima);
  }
  return { radice: livelloScena, sopra: livelloAnteprima! };
}

/** Anteprima della carta o del territorio sotto il mouse (non si mostra se c'e' una finestra aperta sopra la scena). */
export function disegnaAnteprima(app: Application, c: Controller, ui: UiStato): void {
  const { sopra } = livelli(app);
  for (const ch of sopra.removeChildren()) ch.destroy({ children: true });
  const opz = c.opzioni();
  const modale = opz.cerca.length > 0 || !!c.decisione || !!c.evento || ui.regole || c.finita || !!ui.grande;
  if (modale || (!ui.zoom && ui.zoomTerr === null)) return;
  const W = app.screen.width;
  const H = app.screen.height;
  const d = new Disegno(sopra, Math.max(0.7, Math.min(W / 956, H / 440)));
  if (ui.zoom) zoomCarta(d, c, ui.zoom, W, H, 30 * d.u);
  else zoomCarta(d, c, null, W, H, 30 * d.u, ui.zoomTerr);
}

let fuori: string[] = [];
/** Testi che sforano lo schermo nell'ultimo disegno (serve ai test automatici). */
export function testiFuoriSchermo(): string[] {
  return fuori;
}

// ======================= sfondo e quadri =======================

function sfondo(d: Disegno, W: number, H: number): void {
  const t = texturaSfondo();
  if (!t) return;
  const { k, ox, oy } = coverTrasformazione(W, H);
  const sp = new Sprite(t);
  sp.scale.set((IMG_W * k) / t.width, (IMG_H * k) / t.height);
  sp.x = ox;
  sp.y = oy;
  d.s.addChild(sp);
}

function glowQuadro(d: Disegno, vis: Area): void {
  d.alone(vis.x + 5 * d.u, vis.y + 5 * d.u, vis.w - 10 * d.u, vis.h - 10 * d.u, COL.oroChiaro, 0.85, 22, 10);
}

/** Il pozzo di R'lyeh: ellisse toccabile al centro; visibile ma non in gioco. */
function pozzo(d: Disegno, st: Settore, vis: Area, reg: Area, az: Azioni): void {
  const g = new Graphics();
  g.ellipse(vis.x + vis.w / 2, vis.y + vis.h / 2, vis.w / 2, vis.h / 2).fill({ color: 0x000000, alpha: 0.18 });
  g.eventMode = 'static';
  g.cursor = 'pointer';
  g.on('pointertap', () => az.settore(st.id));
  d.s.addChild(g);
  d.aree[`settore:${st.id}`] = reg;
}

// ======================= targhetta di un territorio =======================

function disco(d: Disegno, cx: number, cy: number, r: number, faz: string, togliibile: boolean): void {
  const col = faz === 'custodi' ? 0xb3301f : 0x2f8a4c;
  const luce = faz === 'custodi' ? 0xff7a62 : 0x9ff0b8;
  if (togliibile) {
    d.cerchio(cx, cy, r, 0x000000, { alpha: 0.35, stroke: luce, sw: 1.8 });
  } else {
    d.cerchio(cx, cy, r + 2 * d.u, luce, { alpha: 0.28 });
    d.cerchio(cx, cy, r, col, { stroke: luce, sw: 1 });
    d.cerchio(cx - r * 0.3, cy - r * 0.32, r * 0.38, luce, { alpha: 0.8 });
  }
}

function targhetta(d: Disegno, c: Controller, ui: UiStato, az: Azioni, v: Vista, t: VistaTerritorio, i: number, st: Settore, vis: Area, opz: ReturnType<Controller['opzioni']>, hBar: number, W: number): Area {
  const u = d.u;
  const alt = 28 * u;
  const nome = st.nome;
  const wNome = d.larghezza(nome, 12.5, { titoli: true, bold: true });
  const wNum = 15 * u;
  const wPip = 5 * 8.5 * u;
  const hanLui = t.loroTappa;
  const hanMio = t.mioTappa;
  const wDischi = (hanLui ? 19 * u : 0) + (hanMio ? 19 * u : 0);
  const wp = 10 * u + wNome + 10 * u + wNum + 8 * u + wPip + 8 * u + wNum + (wDischi ? 8 * u : 0) + wDischi + 10 * u;
  const xp = st.lato === 'sx' ? vis.x + 8 * u : vis.x + vis.w - 8 * u - wp;
  const xpc = Math.max(4 * u, Math.min(W - 4 * u - wp, xp));
  const yp = Math.max(vis.y, hBar) + 5 * u;
  d.rett(xpc, yp, wp, alt, 0, {
    r: 4 * u, tex: texturaGradiente([[0, 'rgba(28,20,12,0.94)'], [1, 'rgba(14,10,6,0.94)']], true), stroke: COL.oroScuro, sw: 1,
    id: `terrnome:${i}`, tap: () => az.grande({ tipo: 'terr', i }),
  });
  let x = xpc + 10 * u;
  const cy = yp + alt / 2;
  d.testo(nome, x, cy, 12.5, COL.inciso, { titoli: true, bold: true, anchorY: 0.5 }).y = cy;
  x += wNome + 10 * u;
  d.testo(String(t.forzaLoro), x + wNum / 2, cy, 16, COL.lui, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 }).y = cy;
  x += wNum + 8 * u;
  for (let k = 1; k <= 5; k++) {
    const pieno = k <= t.inst;
    const col = pieno ? (k > 3 ? 0xe2553f : 0xe0a341) : 0xffffff;
    if (pieno) d.cerchio(x + 3.5 * u, cy, 5 * u, col, { alpha: 0.28 });
    d.cerchio(x + 3.5 * u, cy, 3.3 * u, col, { alpha: pieno ? 1 : 0.22 });
    x += 8.5 * u;
  }
  x += 8 * u;
  d.testo(String(t.forzaMia), x + wNum / 2, cy, 16, COL.tu, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 }).y = cy;
  x += wNum + 8 * u;
  if (hanLui) { disco(d, x + 7 * u, cy, 6 * u, v.fazioneAvv, t.loroTappaTogliibile); x += 19 * u; }
  if (hanMio) { disco(d, x + 7 * u, cy, 6 * u, v.fazione, t.mioTappaTogliibile); x += 19 * u; }
  let y = yp + alt + 3 * u;
  let xMin = xpc;
  let xMax = xpc + wp;
  // tappe non ancora al sicuro: in piccolo, quando
  const sigAvv = v.fazioneAvv === 'custodi' ? 'Sigillo' : 'Rito';
  const sigMio = v.fazione === 'custodi' ? 'Sigillo' : 'Rito';
  const righe: string[] = [];
  if (hanLui && t.loroTappaTogliibile) righe.push(`${sigAvv} di Lui: al sicuro dopo il tuo turno`);
  if (hanMio && t.mioTappaTogliibile) righe.push(`${sigMio} tuo: al sicuro dopo il turno di Lui`);
  for (const r of righe) {
    const wr = Math.min(wp, d.larghezza(r, 10.5, { corsivo: true }) + 12 * u);
    const xr = st.lato === 'sx' ? xpc : xpc + wp - wr;
    xMin = Math.min(xMin, xr);
    xMax = Math.max(xMax, xr + wr);
    d.rett(xr, y, wr, 14 * u, 0x0a0704, { alpha: 0.78, r: 7 * u });
    d.testo(r, xr + wr / 2, y + 7 * u, 10.5, COL.oroChiaro, { corsivo: true, anchorX: 0.5, anchorY: 0.5 }).y = y + 7 * u;
    y += 16 * u;
  }
  // miniature delle carte giocate: Lui (verde) e Tu (blu)
  const mw = 28 * u;
  const mh = 38 * u;
  const gap = 3 * u;
  const n = t.loro.length + t.mie.length;
  if (n > 0) {
    const sep = t.loro.length && t.mie.length ? 7 * u : 0;
    const totale = n * mw + (n - 1) * gap + sep;
    let xm = st.lato === 'sx' ? xpc : xpc + wp - totale;
    xMin = Math.min(xMin, xm);
    xMax = Math.max(xMax, xm + totale);
    const mini = (p: VistaPresenza, mio: boolean): void => {
      const bersaglio = opz.pres.includes(p.uid);
      const filo = mio ? 0x6aa8f0 : 0x5fb878;
      if (bersaglio) d.alone(xm, y, mw, mh, COL.selezione, 1, 12, 3);
      const cont = new Container();
      d.s.addChild(cont);
      d.rett(xm - 1.5 * u, y - 1.5 * u, mw + 3 * u, mh + 3 * u, 0x000000, { r: 3 * u, alpha: 0.9 });
      if (!d.immagine(idImmagine(p.id, p.trasformata), xm, y, mw, mh, 1, 3)) d.rett(xm, y, mw, mh, colori(p.id).scuro, { r: 3 * u });
      d.rett(xm, y, mw, mh, 0xffffff, {
        alpha: 0.001, r: 3 * u, stroke: bersaglio ? COL.selezione : filo, sw: bersaglio ? 2.6 : 1.5, id: `pres:${p.uid}`,
        tap: () => { if (c.opzioni().pres.includes(p.uid)) { c.scegliPresenza(p.uid); az.rerender(); } else az.grande({ tipo: 'carta', id: p.id, trasformata: p.trasformata }); },
        over: () => az.zoom({ id: p.id, trasformata: p.trasformata }), out: () => az.zoom(null),
      });
      const fw = 13 * u;
      d.rett(xm + mw - fw, y + mh - 14 * u, fw, 14 * u, 0x000000, { alpha: 0.86, r: 2 * u });
      d.testo(String(p.forza), xm + mw - fw / 2, y + mh - 7 * u, 10.5, mio ? 0xcfe4ff : 0xbff0cc, { titoli: true, bold: true, anchorX: 0.5, anchorY: 0.5 }).y = y + mh - 7 * u;
      if (p.trasformata) d.testo('✦', xm + 2 * u, y + 1 * u, 10, 0xd08cff, { bold: true });
      xm += mw + gap;
    };
    t.loro.forEach((p) => mini(p, false));
    xm += sep;
    t.mie.forEach((p) => mini(p, true));
    y += mh + 5 * u;
  }
  // bottone dorato: solo quando l'azione e' possibile
  const puo = c.puoTappa(i);
  const nomeBtn = v.fazione === 'custodi' ? 'PONI SIGILLO' : 'COMPLETA RITO';
  if (puo) {
    const et = `${nomeBtn} · ${t.costoTappa}`;
    const wb = d.larghezza(et, 10.5, { titoli: true, bold: true, ls: 0.5 }) + 26 * u;
    const xb = st.lato === 'sx' ? xpc : xpc + wp - wb;
    d.pillolaOro(`btn:tappa:${i}`, et, xb, y, 24 * u, () => { c.tappa(i); az.rerender(); });
    xMin = Math.min(xMin, xb);
    xMax = Math.max(xMax, xb + wb);
    y += 24 * u;
  } else if (ui.tutorial?.passo === 4) {
    // durante il tutorial del Sigillo/rito il bottone si vede anche spento, con il motivo
    const motivo = motivoTappa(v, t);
    const et = motivo ? `${nomeBtn}: ${motivo}` : nomeBtn;
    const wb = Math.min(wp + 40 * u, d.larghezza(et, 10, { titoli: true, bold: true }) + 26 * u);
    const xb = st.lato === 'sx' ? xpc : xpc + wp - wb;
    d.pillolaOro(`btn:tappa:${i}`, et, xb, y, 24 * u, () => undefined, 10, false);
    y += 24 * u;
  }
  return { x: xMin - 4 * u, y: yp - 4 * u, w: xMax - xMin + 8 * u, h: y - yp + 8 * u };
}

// ======================= barra in alto =======================

function barraAlto(d: Disegno, c: Controller, v: Vista, W: number, hBar: number, colAvv: number): void {
  void colAvv;
  const u = d.u;
  d.rett(0, 0, W, hBar, 0, { r: 0, tex: texturaGradiente([[0, 'rgba(8,6,4,0.94)'], [1, 'rgba(8,6,4,0.55)']], true) });
  const cy = hBar / 2;
  const nome = NOME_FAZ[v.fazioneAvv].toUpperCase();
  const col = COL_FAZ[v.fazioneAvv];
  let x = 12 * u;
  const t1 = d.testo(nome, x, cy, 12, col, { titoli: true, bold: true, ls: 1, anchorY: 0.5 });
  t1.y = cy;
  x += t1.width + 10 * u;
  const tappe = v.fazioneAvv === 'custodi' ? 'Sigilli' : 'Riti';
  const stat = `Esposizione ${v.esposizioneAvv}/10 · Mano ${v.nManoAvv} · Mazzo ${v.nMazzoAvv} · ${tappe} ${v.tappeAvv}/3`;
  const t2 = d.testo(stat, x, cy, 12, 0xcfc6b0, { anchorY: 0.5 });
  t2.y = cy;
  x += t2.width + 14 * u;
  // a destra: giro, fase, prossimo evento
  const fase = v.giro <= 3 ? 'I' : v.giro <= 6 ? 'II' : 'III';
  const tg = d.testo(`GIRO ${v.giro} · FASE ${fase}`, W - 12 * u, 3 * u, 11, COL.oroChiaro, { titoli: true, bold: true, ls: 1, anchorX: 1 });
  const ev = d.testo(`Prossimo evento: ${NOME_TIPO_EVENTO[v.prossimoEvento] ?? v.prossimoEvento}`, W - 12 * u, 3 * u + tg.height, 10.5, 0xd8c07a, { anchorX: 1, corsivo: true });
  const xr = W - 12 * u - Math.max(tg.width, ev.width) - 14 * u;
  const msg = c.messaggio.length > 170 ? c.messaggio.slice(0, 167) + '…' : c.messaggio;
  const wMsg = xr - x;
  if (wMsg > 60 * u) d.adatta(msg, x, 2 * u, wMsg, hBar - 3 * u, 13, 10, 0xe6dcc4, false, 'left', { corsivo: true });
  if (v.eventiVisti.length) d.testo(`Eventi già usciti: ${v.eventiVisti.join(', ')}`, W - 12 * u, hBar + 2 * u, 10, COL.tenue, { anchorX: 1, alpha: 0.9 });
}

// ======================= mano =======================

interface RisMano {
  /** y del bordo alto delle carte (abbassate o alzate). */
  yAlto: number;
  /** Ingombro della mano (carte aperte a ventaglio comprese). */
  zona: Area;
}

function disegnaMano(d: Disegno, c: Controller, ui: UiStato, az: Azioni, v: Vista, sel: Controller['selezione'], W: number, H: number): RisMano {
  const u = d.u;
  const n = v.mano.length;
  const cw = 84 * u;
  const ch = 118 * u;
  const alzata = ui.manoAlzata || sel.carta !== undefined;
  const yAlto = alzata ? H - ch - 10 * u : H - 52 * u;
  const zonaX0 = 150 * u;
  const zonaW = W - 2 * zonaX0;
  const passo = n > 1 ? Math.min(cw * 0.9, (zonaW - cw) / (n - 1)) : 0;
  const totale = n > 0 ? passo * (n - 1) + cw : 0;
  const x0 = (W - totale) / 2;
  // zona della mano: un tocco la alza o la abbassa
  const zx = Math.min(x0, W / 2 - 80 * u) - 12 * u;
  const zw = Math.max(totale, 160 * u) + 24 * u;
  d.rett(zx, yAlto - 10 * u, zw, H - yAlto + 10 * u, 0xffffff, { alpha: 0.001, r: 0, tap: () => az.alzaMano() });
  d.aree['mano:tutta'] = { x: zx, y: yAlto - 4 * u, w: zw, h: H - yAlto + 4 * u };
  v.mano.forEach((cd, k) => {
    const scelta = sel.carta === cd.uid;
    const giocabile = c.giocabile(cd.uid);
    const cx = x0 + k * passo + cw / 2;
    const yTop = yAlto - (scelta ? 12 * u : 0);
    const cont = new Container();
    cont.pivot.set(cw / 2, ch * 1.15);
    cont.position.set(cx, yTop + ch * 1.15);
    cont.rotation = ((k - (n - 1) / 2) * 3 * Math.PI) / 180;
    cont.alpha = giocabile || scelta ? 1 : 0.55;
    d.s.addChild(cont);
    const dati = datiDaCarta(c, cd.id, cd.trasformata);
    const ris = cartaRidotta(cont, d, cw, ch, dati, { selezionata: scelta, giocabile });
    // area toccabile (la parte visibile)
    cont.eventMode = 'static';
    cont.cursor = 'pointer';
    cont.label = 'zoomable';
    cont.hitArea = new Rectangle(0, 0, cw, ch);
    cont.on('pointertap', () => {
      // si decide al momento del tocco (la scena puo' non essere ancora ridisegnata dopo l'ultima mossa del computer)
      ui.manoAlzata = false;
      if (c.selezione.carta === cd.uid || c.giocabile(cd.uid)) { c.scegliCarta(cd.uid); az.rerender(); } else { ui.manoAlzata = true; az.motivo(cd.uid); }
    });
    cont.on('pointerover', (e) => { if (e.pointerType === 'mouse') az.zoom({ id: cd.id, trasformata: cd.trasformata }); });
    cont.on('pointerout', (e) => { if (e.pointerType === 'mouse') az.zoom(null); });
    // punto di tocco: nella parte sinistra dell'illustrazione (la destra puo' essere coperta dalla carta vicina, aperta a ventaglio)
    const pt = cont.toGlobal({ x: cw * 0.28, y: 30 * u });
    d.aree[`mano:${cd.uid}`] = { x: pt.x - 10 * u, y: pt.y - 8 * u, w: 20 * u, h: 16 * u };
    // lente
    const lente = new Graphics();
    lente.circle(ris.lente.x + ris.lente.w / 2, ris.lente.y + ris.lente.h / 2, ris.lente.w / 2 + 2 * u).fill({ color: 0xffffff, alpha: 0.001 });
    lente.eventMode = 'static';
    lente.cursor = 'pointer';
    lente.on('pointertap', (e) => { e.stopPropagation(); az.grande({ tipo: 'carta', id: cd.id, trasformata: cd.trasformata }); });
    cont.addChild(lente);
    const gp = cont.toGlobal({ x: ris.lente.x, y: ris.lente.y });
    d.aree[`lente:${cd.uid}`] = { x: gp.x, y: gp.y, w: ris.lente.w, h: ris.lente.h };
  });
  return { yAlto, zona: { x: Math.min(x0, W / 2 - 80 * u) - 40 * u, y: H - ch - 40 * u, w: Math.max(totale, 160 * u) + 80 * u, h: ch + 40 * u } };
}

// ======================= energia, fine turno, regole e registro =======================

function controlli(d: Disegno, c: Controller, ui: UiStato, az: Azioni, v: Vista, sel: Controller['selezione'], opz: ReturnType<Controller['opzioni']>, W: number, H: number): Area[] {
  const u = d.u;
  const ingombri: Area[] = [];
  // --- energia (in basso a sinistra) ---
  const pw = 112 * u;
  const ph = 124 * u;
  const px = 10 * u;
  const py = H - ph - 10 * u;
  d.rett(px, py, pw, ph, 0x0a0704, { alpha: 0.82, stroke: COL.oroScuro, sw: 1, r: 8 * u });
  d.aree['pannello:energia'] = { x: px, y: py, w: pw, h: 62 * u };
  ingombri.push({ x: px, y: py, w: pw, h: ph });
  const gx = px + 26 * u;
  const gy = py + 26 * u;
  const gem = new Graphics();
  gem.roundRect(gx - 14 * u, gy - 14 * u, 28 * u, 28 * u, 5 * u).fill(0x2a5ea8).stroke({ width: 2, color: 0xc9d6e6 });
  gem.roundRect(gx - 9 * u, gy - 12 * u, 12 * u, 12 * u, 3 * u).fill({ color: 0xe8f4ff, alpha: 0.7 });
  gem.rotation = Math.PI / 4;
  gem.pivot.set(gx, gy);
  gem.position.set(gx, gy);
  d.s.addChild(gem);
  d.testo(String(v.energia), gx, gy, 18, 0x10233d, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 }).y = gy;
  d.testo('ENERGIA', px + 48 * u, py + 8 * u, 10.5, 0x9cc4f5, { titoli: true, bold: true, ls: 0.5 });
  const tappeEt = v.fazione === 'custodi' ? 'Sigilli' : 'Riti';
  d.testo(`${tappeEt} ${v.tappe}/3`, px + 48 * u, py + 24 * u, 11.5, 0xe6dcc4);
  d.testo(`Esposizione ${v.esposizione}/10`, px + 8 * u, py + 54 * u, 11.5, v.esposizione >= 6 ? COL.pericolo : 0xe6dcc4, { bold: v.esposizione >= 6 });
  d.testo(`Mazzo ${v.nMazzo}`, px + 8 * u, py + 70 * u, 11.5, 0xcfc6b0);
  const riduci = c.puoRidurre();
  d.pillolaOro('btn:riduci', 'RIDUCI · 2', px + 8 * u, py + ph - 30 * u, 22 * u, () => { c.riduci(); az.rerender(); }, 10, riduci);

  // --- fine turno / gioca (in basso a destra) ---
  const r = 39 * u;
  const cx = W - 10 * u - r;
  const cy = H - 10 * u - r;
  const tuo = c.tuoTurno && !c.decisione;
  const medaglione = (id: string, riga1: string, riga2: string, colore: number, luce: number, attivo: boolean, tap: () => void): void => {
    if (attivo) d.cerchio(cx, cy, r + 8 * u, luce, { alpha: 0.28 });
    const g = new Graphics();
    g.circle(cx, cy, r).fill({ color: 0x3a2a10 }).stroke({ width: 2, color: 0x3a2a10 });
    g.circle(cx, cy, r - 2 * u).fill({ color: 0x8a6a2e });
    g.circle(cx, cy, r - 6 * u).fill({ color: attivo ? colore : 0x2a2622 });
    g.circle(cx - r * 0.18, cy - r * 0.22, r * 0.5).fill({ color: luce, alpha: attivo ? 0.3 : 0.05 });
    g.eventMode = attivo ? 'static' : 'none';
    g.cursor = 'pointer';
    if (attivo) g.on('pointertap', tap);
    d.s.addChild(g);
    d.aree[id] = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
    ingombri.push({ x: cx - r - 8 * u, y: cy - r - 8 * u, w: 2 * r + 16 * u, h: 2 * r + 16 * u });
    d.testo(riga1, cx, riga2 ? cy - 6 * u : cy, 11, attivo ? 0xfff2d0 : 0x7a7260, { titoli: true, bold: true, peso: '900', ls: 0.6, anchorX: 0.5, anchorY: 0.5 }).y = riga2 ? cy - 6 * u : cy;
    if (riga2) d.testo(riga2, cx, cy + 7 * u, 11, attivo ? 0xfff2d0 : 0x7a7260, { titoli: true, bold: true, peso: '900', ls: 0.6, anchorX: 0.5, anchorY: 0.5 }).y = cy + 7 * u;
  };
  if (opz.pronta) medaglione('btn:gioca', 'GIOCA', 'LA CARTA', 0x2f7a45, 0x9ff0b8, true, () => { c.giocaSelezionata(); az.rerender(); });
  else if (c.tuoTurno) medaglione('btn:fine', 'FINE', 'TURNO', 0x8a2214, 0xe6784a, tuo, () => { c.fine(); az.rerender(); });
  else medaglione('btn:fine', 'TURNO', 'DI LUI', 0x3a3a3a, 0x888888, false, () => undefined);

  // --- icone: annulla (con una carta in mano), regole, registro ---
  const ic = 28 * u;
  let xi = cx - r - 12 * u - ic;
  const yi = H - 10 * u - ic;
  const icona = (id: string, tap: () => void, disegna: (g: Graphics, ox: number, oy: number) => void): void => {
    d.rett(xi, yi, ic, ic, 0x0a0704, { r: ic / 2, alpha: 0.85, stroke: COL.oroScuro, sw: 1.2, id, tap });
    const g = new Graphics();
    disegna(g, xi + ic / 2, yi + ic / 2);
    d.s.addChild(g);
    xi -= ic + 8 * u;
  };
  icona('btn:copia', () => az.copia(), (g, ox, oy) => {
    g.roundRect(ox - 6 * u, oy - 8 * u, 12 * u, 16 * u, 2 * u).stroke({ width: 1.5, color: COL.inciso });
    g.moveTo(ox - 3 * u, oy - 3 * u).lineTo(ox + 3 * u, oy - 3 * u).moveTo(ox - 3 * u, oy + 1 * u).lineTo(ox + 3 * u, oy + 1 * u).moveTo(ox - 3 * u, oy + 5 * u).lineTo(ox + 1 * u, oy + 5 * u).stroke({ width: 1.2, color: COL.inciso });
  });
  icona('btn:regole', () => az.regole(true), (g, ox, oy) => {
    g.circle(ox, oy, 8 * u).stroke({ width: 1.5, color: COL.inciso });
    const t = d.testo('?', ox, oy, 13, COL.inciso, { titoli: true, bold: true, anchorX: 0.5, anchorY: 0.5 });
    t.y = oy;
  });
  if (sel.carta !== undefined) {
    icona('btn:annulla', () => { c.annulla(); ui.manoAlzata = false; az.rerender(); }, (g, ox, oy) => {
      g.moveTo(ox - 6 * u, oy - 6 * u).lineTo(ox + 6 * u, oy + 6 * u).moveTo(ox + 6 * u, oy - 6 * u).lineTo(ox - 6 * u, oy + 6 * u).stroke({ width: 2, color: 0xff9a8a });
    });
  }
  if (ui.copiato) d.testo(ui.copiato, cx - r - 12 * u, yi - 14 * u, 11, COL.valido, { anchorX: 1, bold: true });
  ingombri.push({ x: xi, y: yi - 4 * u, w: cx - r - xi, h: ic + 8 * u });
  return ingombri;
}

/** Per ogni quadro sceglie un punto della parte visibile lontano da targhette, mano, controlli e pozzo (serve ai test automatici e al tutorial). */
function puntiLiberi(d: Disegno, c: Controller, visibili: Map<string, Area>, ostacoli: Area[], terrDelSettore: (st: Settore) => number): void {
  void c;
  const u = d.u;
  const pz = visibili.get('rlyeh')!;
  const nelPozzo = (x: number, y: number, m: number): boolean => {
    const dx = (x - (pz.x + pz.w / 2)) / (pz.w / 2 + m);
    const dy = (y - (pz.y + pz.h / 2)) / (pz.h / 2 + m);
    return dx * dx + dy * dy < 1;
  };
  const libero = (x: number, y: number, margine: number): boolean => !ostacoli.some((o) => x > o.x - margine && x < o.x + o.w + margine && y > o.y - margine && y < o.y + o.h + margine);
  for (const st of SETTORI) {
    const vis = visibili.get(st.id)!;
    const cx = vis.x + vis.w * 0.5;
    const cy = vis.y + vis.h * 0.5;
    let meglio: { x: number; y: number } | null = null;
    if (st.id === 'rlyeh') { meglio = { x: cx, y: cy }; } else {
      // prima con un bel margine, poi sempre meno
      for (const [mO, mP] of [[14, 16], [6, 8], [2, 2]] as const) {
        let dmin = Infinity;
        for (let gy = 0.03; gy < 1; gy += 0.03) {
          for (let gx = 0.02; gx < 1; gx += 0.02) {
            const x = vis.x + gx * vis.w;
            const y = vis.y + gy * vis.h;
            if (!libero(x, y, mO * u) || nelPozzo(x, y, mP * u)) continue;
            const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy);
            if (dd < dmin) { dmin = dd; meglio = { x, y }; }
          }
        }
        if (meglio) break;
      }
    }
    const p = meglio ?? { x: cx, y: cy };
    const reg: Area = { x: p.x - 14 * u, y: p.y - 9 * u, w: 28 * u, h: 18 * u };
    const i = terrDelSettore(st);
    if (i >= 0) d.aree[`terr:${i}`] = reg;
    else d.aree[`settore:${st.id}`] = reg;
  }
}

// ======================= schede e sovrapposizioni =======================

function riquadroCentrale(d: Disegno, W: number, H: number, w: number, h: number, bordo = 0x8aa0c8): { x: number; y: number; w: number; h: number } {
  d.rett(0, 0, W, H, 0x000000, { r: 0, alpha: 0.62, id: 'velo', tap: () => undefined });
  const x = (W - w) / 2;
  const y = (H - h) / 2;
  d.rett(x, y, w, h, 0x161b26, { stroke: bordo, sw: 2.5 });
  return { x, y, w, h };
}

/** Anteprima al passaggio del mouse: la carta completa in alto al centro. */
function zoomCarta(d: Disegno, c: Controller, z: ZoomInfo | null, W: number, H: number, hBar: number, terr: number | null = null): void {
  const u = d.u;
  const dati = z ? datiDaCarta(c, z.id, z.trasformata) : datiTerritorio(c, terr!);
  const w = Math.min(250 * u, (H - hBar - 16 * u) / (330 / 236), W * 0.4);
  cartaGrande(d, W / 2 - w / 2, hBar + 8 * u, w, dati, { completa: true, alone: true });
}

function sceltaCerca(d: Disegno, c: Controller, ids: string[], W: number, H: number, az: Azioni): void {
  const u = d.u;
  const w = Math.min(360 * u, W * 0.7);
  const bh = 24 * u;
  const h = 40 * u + ids.length * (bh + 4 * u);
  const r = riquadroCentrale(d, W, H, w, Math.min(h, H - 20 * u));
  d.testo('Pagina del Necronomicon: scegli una carta azione dal mazzo', r.x + 10 * u, r.y + 8 * u, 12.5, COL.oro, { bold: true, w: w - 20 * u });
  ids.forEach((id, k) => {
    d.bottone(`cerca:${id}`, carta(c.cat, id, false).nome, r.x + 10 * u, r.y + 34 * u + k * (bh + 4 * u), w - 20 * u, bh, true, () => { c.scegliCerca(id); az.rerender(); }, 0x2d3b55, 12);
  });
}

function riordinoBiblioteca(d: Disegno, c: Controller, uids: number[], ui: UiStato, W: number, H: number, az: Azioni): void {
  const u = d.u;
  const w = Math.min(560 * u, W * 0.9);
  const h = Math.min(190 * u, H - 20 * u);
  const r = riquadroCentrale(d, W, H, w, h);
  d.testo('Biblioteca della Miskatonic: guarda le prime 3 carte del mazzo e riordinale', r.x + 10 * u, r.y + 8 * u, 12.5, COL.oro, { bold: true, w: w - 20 * u });
  d.testo('Tocca le carte nell\'ordine in cui vuoi pescarle (la prima toccata sarà la prossima).', r.x + 10 * u, r.y + 28 * u, 11.5, COL.tenue, { w: w - 20 * u });
  const cw = (w - 40 * u) / 3;
  const ch = h - 90 * u;
  uids.forEach((uid, k) => {
    const pos = ui.ordine.indexOf(uid);
    d.rett(r.x + 10 * u + k * (cw + 10 * u), r.y + 52 * u, cw, ch, pos >= 0 ? 0x2f5a3a : 0x1f2735, {
      stroke: pos >= 0 ? COL.valido : 0x8aa0c8, id: `riordina:${uid}`, tap: () => az.ordine(uid),
    });
    d.adatta(c.nomeCarta(uid), r.x + 14 * u + k * (cw + 10 * u), r.y + 58 * u, cw - 8 * u, ch - 24 * u, 14, 10, 0xffffff, true, 'center', { titoli: true });
    if (pos >= 0) d.testo(`${pos + 1}ª`, r.x + 10 * u + k * (cw + 10 * u) + cw / 2, r.y + 52 * u + ch - 22 * u, 15, COL.valido, { bold: true, titoli: true, anchorX: 0.5 });
  });
  d.bottone('btn:tieni', 'Tieni l\'ordine', r.x + 10 * u, r.y + h - 30 * u, 140 * u, 24 * u, true, () => az.ordine('tieni'), 0x2d3b55, 12);
  d.bottone('btn:azzera', 'Ricomincia', r.x + 160 * u, r.y + h - 30 * u, 110 * u, 24 * u, ui.ordine.length > 0, () => az.ordine('azzera'), 0x2d3b55, 12);
}

/** Scheda grande: la carta con la sua cornice a sinistra, le note a destra. Un tocco ovunque la chiude. */
function schedaGrande(d: Disegno, W: number, H: number, dati: DatiCarta, note: string[], chiudi: () => void, id: string, sopra = ''): void {
  const u = d.u;
  d.rett(0, 0, W, H, 0x000000, { r: 0, alpha: 0.72, id, tap: chiudi });
  const cw = Math.min((H - 14 * u) / (330 / 236), W * 0.42);
  const ch = altezzaCarta(cw);
  const pw = Math.min(310 * u, W - cw - 50 * u);
  const x0 = (W - cw - 16 * u - pw) / 2;
  const y0 = (H - ch) / 2;
  cartaGrande(d, x0, y0, cw, dati, { completa: true, alone: true });
  const px = x0 + cw + 16 * u;
  let y = y0 + ch * 0.12;
  if (sopra) { d.testo(sopra, px, y, 12, tavolozza(dati.schema).luce, { titoli: true, bold: true, ls: 1 }); y += 22 * u; }
  for (const riga of note) {
    const t = d.testo(riga, px, y, 13.5, 0xe6dcc4, { w: pw });
    y += t.height + 8 * u;
  }
  d.testo('Tocca per chiudere', px, y0 + ch - 16 * u, 11, COL.tenue);
}

function vistaGrande(d: Disegno, c: Controller, g: NonNullable<UiStato['grande']>, W: number, H: number, az: Azioni): void {
  const chiudi = () => az.grande(null);
  if (g.tipo === 'carta') {
    const e = carta(c.cat, g.id, g.trasformata);
    const def = c.cat.carte.get(g.id)!;
    const note = [`Costo ${e.costo}` + (e.tipo === 'presenza' ? ` · forza ${e.forza}` : '')];
    if (e.potente) note.push(`Carta potente: fa salire l'esposizione di ${e.potente} (a 3, 6 e 9 una carta del mazzo diventa cosmica ✦).`);
    if (g.trasformata) note.push('Versione cosmica ✦.');
    else if (def.versione_cosmica) note.push(`Versione cosmica: ${def.versione_cosmica.nome}.`);
    schedaGrande(d, W, H, datiDaCarta(c, g.id, g.trasformata), note, chiudi, 'grande:chiudi');
  } else {
    const t = c.cat.dati.territori[g.i];
    const r = t.riserva[0];
    schedaGrande(d, W, H, datiTerritorio(c, g.i), [`Carta della riserva: ${r.nome} (${r.copie} copie).`, r.effetto], chiudi, 'grande:chiudi', 'TERRITORIO');
  }
}

function eventoCosmico(d: Disegno, c: Controller, W: number, H: number, az: Azioni): void {
  const e = c.evento!;
  schedaGrande(d, W, H, datiEvento(c, e), [e.tipo === '?' ? 'Evento improvviso.' : `Tipo: ${NOME_TIPO_EVENTO[e.tipo] ?? e.tipo}.`], () => az.chiudiEvento(), 'evento:chiudi', 'EVENTO COSMICO');
}

function pannelloRegole(d: Disegno, W: number, H: number, az: Azioni): void {
  const u = d.u;
  const w = Math.min(760 * u, W * 0.95);
  const h = Math.min(400 * u, H - 8 * u);
  const r = riquadroCentrale(d, W, H, w, h);
  d.rett(r.x, r.y, w, h, 0x161b26, { stroke: 0x8aa0c8, sw: 2.5, id: 'regole:chiudi', tap: () => az.regole(false) });
  const righe = [
    'COME SI GIOCA IN BREVE',
    'Ogni giro gioca prima un giocatore, poi l\'altro; poi agisce la forza cosmica con un evento. Il tipo del prossimo evento si vede in alto a destra.',
    'Nel tuo turno ricevi energia e pesci una carta; giochi le carte che l\'energia permette. Tocca una carta, poi il territorio o la presenza bersaglio.',
    'Controlla un territorio chi vi ha più forza (parità: nessuno). Massimo 4 presenze per territorio. Controllare un territorio dà una carta della sua riserva.',
    'Le carte potenti fanno salire anche l\'esposizione (a 3, 6, 9 una carta del mazzo diventa cosmica ✦) e l\'instabilità del territorio.',
    'Instabilità 4: le presenze perdono 1 forza. Instabilità 5: scatta l\'effetto cosmico del territorio a fine giro.',
    'Custodi: poni tre Sigilli (territorio che controlli, instabilità 3 o meno). Risvegliati: completa tre riti (una presenza, forza almeno pari, instabilità 3 o più).',
    'Con la penultima tappa scatta il SEGNALE: l\'avversario ha un turno di avviso. Le tappe si possono togliere solo fino alla fine del turno successivo dell\'avversario.',
    'Fine partita: «Copia il registro» (icona in basso a destra) per mandarlo a chi analizza le partite. Tocca per chiudere.',
  ];
  let y = r.y + 8 * u;
  righe.forEach((riga, i) => {
    const t = d.testo(riga, r.x + 12 * u, y, i === 0 ? 14 : 12, i === 0 ? COL.oro : COL.testo, { bold: i === 0, w: w - 24 * u, titoli: i === 0 });
    y += t.height + 5 * u;
  });
}

function fineAPartita(d: Disegno, c: Controller, W: number, H: number, az: Azioni): void {
  const u = d.u;
  const s = c.g.s;
  const w = Math.min(460 * u, W * 0.9);
  const h = Math.min(190 * u, H - 20 * u);
  const r = riquadroCentrale(d, W, H, w, h, COL.oro);
  let titolo: string;
  let col = COL.oro;
  if (s.vincitore === null) titolo = 'Partita interrotta (troppi giri)';
  else if (s.giocatori[s.vincitore].fazione === c.fazioneUmano) { titolo = 'HAI VINTO!'; col = COL.valido; }
  else { titolo = 'HAI PERSO'; col = COL.pericolo; }
  d.testo(titolo, r.x + w / 2, r.y + 12 * u, 26, col, { bold: true, anchorX: 0.5, titoli: true });
  const vinc = s.vincitore === null ? 'Nessun vincitore' : 'Vittoria ' + (s.giocatori[s.vincitore].fazione === 'custodi' ? 'dei Custodi' : 'dei Risvegliati');
  d.testo(`${vinc} · ${s.giro} giri · seme ${s.seme}`, r.x + w / 2, r.y + 52 * u, 13.5, COL.testo, { anchorX: 0.5 });
  d.bottone('fine:copia', 'Copia il registro della partita', r.x + 14 * u, r.y + h - 78 * u, w - 28 * u, 28 * u, true, () => az.copia(), 0x2d3b55, 13);
  d.bottone('fine:nuova', 'Nuova partita', r.x + 14 * u, r.y + h - 44 * u, w - 28 * u, 28 * u, true, () => az.nuova(), 0x2f5a3a, 13);
}

/** Fumetto del tutorial: il campo resta visibile dietro, la zona indicata e' evidenziata da una cornice. */
function tutorialSovrapposto(d: Disegno, passo: ReturnType<typeof passiTutorial>[number], indice: number, W: number, H: number, az: Azioni): void {
  const u = d.u;
  const a = passo.area ? d.aree[passo.area] : undefined;
  const velo = (x: number, y: number, w: number, h: number): void => {
    if (w > 0 && h > 0) d.rett(x, y, w, h, 0x000000, { r: 0, alpha: 0.6, tap: () => undefined });
  };
  if (a) {
    velo(0, 0, W, a.y);
    velo(0, a.y + a.h, W, H - a.y - a.h);
    velo(0, a.y, a.x, a.h);
    velo(a.x + a.w, a.y, W - a.x - a.w, a.h);
    d.rett(a.x - 2 * u, a.y - 2 * u, a.w + 4 * u, a.h + 4 * u, 0xffffff, { alpha: 0, stroke: COL.oro, sw: 3, r: 6 * u });
  } else velo(0, 0, W, H);
  const bw = Math.min(380 * u, W - 20 * u);
  const hT = d.altezza(passo.testo, 13, bw - 20 * u);
  const bh = 40 * u + hT + 34 * u;
  let bx = (W - bw) / 2;
  let by = (H - bh) / 2;
  if (a) {
    bx = Math.max(10 * u, Math.min(W - bw - 10 * u, a.x + a.w / 2 - bw / 2));
    const sotto = a.y + a.h + 10 * u;
    const sopra = a.y - bh - 10 * u;
    by = sotto + bh <= H - 4 * u ? sotto : sopra >= 4 * u ? sopra : Math.max(4 * u, H - bh - 4 * u);
  }
  d.rett(bx, by, bw, bh, 0x161b26, { stroke: COL.oro, sw: 2.5, tap: () => undefined });
  d.testo(`${indice + 1}/6  ${passo.titolo}`, bx + 10 * u, by + 8 * u, 14, COL.oro, { bold: true, titoli: true });
  d.testo(passo.testo, bx + 10 * u, by + 30 * u, 13, 0xffffff, { w: bw - 20 * u });
  const ultimo = indice === 5;
  d.bottone('tut:avanti', ultimo ? 'Fine' : 'Avanti', bx + bw - 100 * u, by + bh - 30 * u, 90 * u, 24 * u, true, () => az.tutorial('avanti'), 0x2a9d55, 12);
  if (!ultimo) d.bottone('tut:salta', 'Salta', bx + bw - 196 * u, by + bh - 30 * u, 90 * u, 24 * u, true, () => az.tutorial('salta'), 0x2d3b55, 12);
}
