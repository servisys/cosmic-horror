// Disegno della scena con PixiJS (grafica essenziale: riquadri puliti, numeri grandi). Nessuna regola qui:
// tutto cio' che si mostra viene dalla vista del giocatore, tutto cio' che si puo' fare viene dal controller (che chiede al motore).
import { Container, Graphics, Sprite, Text, type Application } from 'pixi.js';
import { carta } from '../motore/catalogo.js';
import type { Vista, VistaPresenza } from '../motore/vista.js';
import type { Controller } from './controller.js';
import { idImmagine, texturaDi } from './immagini.js';
import { motivoCartaNonGiocabile, motivoTappa, passiTutorial, suggerimento } from './suggerimento.js';

export interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

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
}

const FONT = "system-ui, 'Segoe UI', Roboto, Arial, sans-serif";
const COL = {
  sfondo: 0x0d1015, pannello: 0x171c26, bordo: 0x2c3444, testo: 0xe8e6e0, tenue: 0x9aa3b2, oro: 0xe0b44c, rosso: 0xd9534f,
  custodi: 0x3f78b5, custodiScuro: 0x172c45, risvegliati: 0x5a9a65, risvegliatiScuro: 0x25361f, riserva: 0xb89a4a, riservaScuro: 0x3a3320,
  selezione: 0xffe27a, valido: 0x6ee7a1, pericolo: 0xff6b5a,
};

export const NOME_FAZ: Record<string, string> = { custodi: 'I Custodi', risvegliati: 'I Risvegliati' };
const NOME_TIPO_EVENTO: Record<string, string> = {
  territorio: 'colpirà un territorio', giocatore: 'colpirà un giocatore', campo: 'colpirà tutto il campo', carte: 'riguarda le carte', '?': '?',
};

function colori(id: string): { chiaro: number; scuro: number } {
  if (id.startsWith('CU')) return { chiaro: COL.custodi, scuro: COL.custodiScuro };
  if (id.startsWith('RI')) return { chiaro: COL.risvegliati, scuro: COL.risvegliatiScuro };
  return { chiaro: COL.riserva, scuro: COL.riservaScuro };
}

/** Dispositivo con il solo tocco (niente passaggio del mouse) o evento di tocco. */
function soloTocco(tipoPuntatore: string): boolean {
  return tipoPuntatore === 'touch' || tipoPuntatore === 'pen' || (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
}

class Disegno {
  /** Immagine di una carta dentro il riquadro (x,y,w,h); se manca, non disegna nulla e ritorna false. */
  immagine(idImg: string, x: number, y: number, w: number, h: number, alpha = 1): boolean {
    const t = texturaDi(idImg);
    if (!t) return false;
    const sp = new Sprite(t);
    // riempie il riquadro mantenendo le proporzioni (taglia l'eccesso)
    const k = Math.max(w / t.width, h / t.height);
    sp.scale.set(k);
    sp.alpha = alpha;
    const mask = new Graphics();
    mask.roundRect(x, y, w, h, 4 * this.u).fill(0xffffff);
    sp.x = x + (w - t.width * k) / 2;
    sp.y = y + (h - t.height * k) / 2;
    sp.mask = mask;
    this.s.addChild(mask);
    this.s.addChild(sp);
    return true;
  }

  aree: Record<string, Area> = {};
  constructor(readonly s: Container, readonly u: number) {}

  rett(x: number, y: number, w: number, h: number, fill: number, opz: { stroke?: number; sw?: number; r?: number; alpha?: number; id?: string; tap?: () => void; over?: () => void; out?: () => void } = {}): Graphics {
    const g = new Graphics();
    g.roundRect(x, y, w, h, opz.r ?? 6 * this.u).fill({ color: fill, alpha: opz.alpha ?? 1 });
    if (opz.stroke !== undefined) g.stroke({ width: (opz.sw ?? 1.5) * Math.max(1, this.u * 0.8), color: opz.stroke });
    if (opz.tap || opz.over) {
      if (opz.over) g.label = 'zoomable';
      g.eventMode = 'static';
      g.cursor = 'pointer';
      if (opz.tap) g.on('pointertap', opz.tap);
      // L'anteprima al passaggio e' solo per il mouse: sul telefono il tocco farebbe aprire l'anteprima (che resterebbe sopra il campo
      // e intercetterebbe i tocchi) e il ridisegno farebbe perdere il tocco stesso. La scheda si apre solo con la lente o toccando.
      if (opz.over) g.on('pointerover', (e) => { if (!soloTocco(e.pointerType)) opz.over!(); });
      if (opz.out) g.on('pointerout', (e) => { if (!soloTocco(e.pointerType)) opz.out!(); });
    }
    if (opz.id) this.aree[opz.id] = { x, y, w, h };
    this.s.addChild(g);
    return g;
  }

  testo(t: string, x: number, y: number, size: number, fill = COL.testo, opz: { bold?: boolean; w?: number; align?: 'left' | 'center' | 'right'; anchorX?: number; anchorY?: number; lh?: number } = {}): Text {
    const tx = new Text({
      text: t,
      style: {
        fontFamily: FONT, fontSize: Math.round(size * this.u), fill, fontWeight: opz.bold ? '700' : '400',
        wordWrap: opz.w !== undefined, wordWrapWidth: opz.w !== undefined ? opz.w : 0, align: opz.align ?? 'left',
        lineHeight: opz.lh ? Math.round(opz.lh * this.u) : undefined,
      },
      resolution: Math.max(2, window.devicePixelRatio || 1),
    });
    tx.x = x;
    tx.y = y;
    if (opz.anchorX !== undefined || opz.anchorY !== undefined) tx.anchor.set(opz.anchorX ?? 0, opz.anchorY ?? 0);
    this.s.addChild(tx);
    return tx;
  }

  /** Testo che si rimpicciolisce (fino a min) finche' sta nel riquadro. */
  adatta(t: string, x: number, y: number, w: number, h: number, max: number, min: number, fill = COL.testo, bold = false, align: 'left' | 'center' = 'center'): Text {
    let size = max;
    let tx = this.testo(t, x, y, size, fill, { w, bold, align });
    while ((tx.height > h * 1.0 || tx.width > w + 1) && size > min) {
      size -= 0.5;
      this.s.removeChild(tx);
      tx.destroy();
      tx = this.testo(t, x, y, size, fill, { w, bold, align });
    }
    if (align === 'center') tx.x = x + (w - tx.width) / 2;
    return tx;
  }

  bottone(id: string, etichetta: string, x: number, y: number, w: number, h: number, abilitato: boolean, tap: () => void, colore = 0x2d3b55, size = 13): void {
    this.rett(x, y, w, h, abilitato ? colore : 0x1a1e27, {
      stroke: abilitato ? 0x8aa0c8 : 0x2c3444, id, tap: abilitato ? tap : undefined,
    });
    this.adatta(etichetta, x + 3 * this.u, y + 2 * this.u, w - 6 * this.u, h - 4 * this.u, size, 9, abilitato ? 0xffffff : 0x667085, true);
    // centro verticale
    const last = this.s.children[this.s.children.length - 1] as Text;
    last.y = y + (h - last.height) / 2;
  }
}

export function disegnaScena(app: Application, c: Controller, ui: UiStato, az: Azioni): Record<string, Area> {
  const W = app.screen.width;
  const H = app.screen.height;
  const u = Math.max(0.7, Math.min(W / 956, H / 440));
  for (const ch of app.stage.removeChildren()) ch.destroy({ children: true });
  const s = new Container();
  app.stage.addChild(s);
  const d = new Disegno(s, u);
  const v: Vista = c.vista();
  const m = 6 * u;
  const opz = c.opzioni();
  const sel = c.selezione;

  d.rett(0, 0, W, H, COL.sfondo, { r: 0 });

  // ---------- barra in alto: avversario, messaggio, giro ----------
  const hTop = Math.max(50, 0.135 * H);
  d.rett(m, m, W - 2 * m, hTop - m, COL.pannello, { stroke: COL.bordo });
  const cAvv = colori(v.fazioneAvv === 'custodi' ? 'CU' : 'RI');
  d.rett(m, m, 6 * u, hTop - m, cAvv.chiaro, { r: 2 });
  d.testo(`AVVERSARIO · ${NOME_FAZ[v.fazioneAvv]}`, m + 14 * u, m + 3 * u, 12, cAvv.chiaro, { bold: true });
  d.testo(`Mano ${v.nManoAvv}   Mazzo ${v.nMazzoAvv}   Esposizione ${v.esposizioneAvv}/10   Tappe ${v.tappeAvv}/3`, m + 14 * u, m + 21 * u, 12, COL.testo);
  const xMsg = W * 0.44;
  const wMsg = W * 0.30;
  const msg = c.messaggio.length > 150 ? c.messaggio.slice(0, 147) + '…' : c.messaggio;
  d.adatta(msg, xMsg, m + 3 * u, wMsg, hTop - 2 * m - 2 * u, 12.5, 9, COL.testo, false, 'left');
  const fase = v.giro <= 3 ? 'I' : v.giro <= 6 ? 'II' : 'III';
  d.testo(`Giro ${v.giro} · fase cosmica ${fase}`, W - m - 12 * u, m + 3 * u, 12, COL.testo, { bold: true, anchorX: 1 });
  d.testo(`Prossimo evento: ${NOME_TIPO_EVENTO[v.prossimoEvento] ?? v.prossimoEvento}`, W - m - 12 * u, m + 21 * u, 12, COL.oro, { anchorX: 1 });
  if (v.eventiVisti.length) d.testo(`Diario: ${v.eventiVisti.join(', ')}`, W - m - 12 * u, m + 36 * u, 10, COL.tenue, { anchorX: 1 });

  // ---------- riga di suggerimento ----------
  let yMid = hTop + m;
  {
    const sug = c.tuoTurno && !c.decisione && !c.finita ? suggerimento(v) : null;
    const nascosta = ui.suggerimentoNascosto && !ui.toast;
    const hS = (nascosta ? 13 : 21) * u;
    const testoS = ui.toast || (sug ? sug.testo : c.finita ? '' : c.tuoTurno ? '' : 'Turno di Lui: aspetta, poi tocca a te.');
    const urgente = !ui.toast && sug?.tipo === 'avversario-un-passo';
    d.rett(m, yMid, W - 2 * m, hS, ui.toast ? 0x3a2a14 : urgente ? 0x4a1f1a : 0x14283a, {
      stroke: ui.toast ? COL.oro : urgente ? COL.pericolo : 0x3f78b5, id: 'suggerimento', tap: () => az.suggerimento(),
    });
    if (nascosta) d.testo('Consiglio nascosto: tocca per mostrarlo', W / 2, yMid + 1 * u, 9.5, COL.tenue, { anchorX: 0.5 });
    else if (testoS) {
      d.testo(ui.toast ? '!' : 'Consiglio:', m + 6 * u, yMid + 4 * u, 10.5, COL.oro, { bold: true });
      d.adatta(testoS, m + (ui.toast ? 18 : 62) * u, yMid + 2 * u, W - 2 * m - (ui.toast ? 26 : 70) * u, hS - 3 * u, 12, 8, 0xffffff, false, 'left');
    }
    yMid += hS + 3 * u;
  }

  // ---------- segnale di vittoria ----------
  if (v.segnaleMio || v.segnaleAvv) {
    const mio = v.segnaleMio;
    const txt = mio ? 'SEGNALE: sei a una sola tappa dalla vittoria. L\'avversario ha il suo turno di avviso.' : `SEGNALE: ${NOME_FAZ[v.fazioneAvv]} sono a una sola tappa dalla vittoria! Hai un turno per fermarli.`;
    d.rett(m, yMid, W - 2 * m, 20 * u, mio ? 0x2a4a2a : 0x5a1f1a, { stroke: mio ? COL.valido : COL.pericolo });
    d.testo(txt, W / 2, yMid + 3 * u, 12, 0xffffff, { bold: true, anchorX: 0.5 });
    yMid += 24 * u;
  }

  // ---------- territori ----------
  const hBottom = Math.max(130, 0.34 * H);
  const yBot = H - hBottom;
  const hMid = yBot - yMid - m;
  const tw = (W - 4 * m) / 3;
  const tNomi = c.cat.dati.territori;
  v.territori.forEach((t, i) => {
    const x = m + i * (tw + m);
    const valido = opz.terr.includes(i);
    const mioCtl = t.controllo === 'io';
    d.rett(x, yMid, tw, hMid, COL.pannello, {
      stroke: valido ? COL.valido : t.controllo === null ? COL.bordo : mioCtl ? colori(v.fazione === 'custodi' ? 'CU' : 'RI').chiaro : cAvv.chiaro,
      sw: valido ? 3.5 : 1.5, id: `terr:${i}`,
      tap: () => { if (valido) { c.scegliTerritorio(i); az.rerender(); } },
      over: () => az.zoomTerritorio(i), out: () => az.zoomTerritorio(null),
    });
    const px = x + 6 * u;
    const pw = tw - 12 * u;
    let y = yMid + 4 * u;
    d.immagine(c.cat.dati.territori[i].id, x + 1, yMid + 1, tw - 2, hMid - 2, 0.16);
    d.adatta(tNomi[i].nome, px, y, pw, 18 * u, 13, 9, COL.testo, true, 'left');
    d.rett(px, y - 2 * u, pw, 20 * u, 0xffffff, { alpha: 0.001, id: `terrnome:${i}`, tap: () => az.grande({ tipo: 'terr', i }) });
    y += 17 * u;
    // instabilita': 5 caselle
    const cas = 12 * u;
    d.testo('Instab.', px, y, 11, COL.tenue);
    for (let k = 0; k < 5; k++) {
      const pieno = k < t.inst;
      const col = pieno ? (k >= 4 ? COL.pericolo : k >= 3 ? 0xf0a040 : 0x8ab4e8) : 0x232a38;
      d.rett(px + 46 * u + k * (cas + 2 * u), y + 1 * u, cas, cas, col, { stroke: 0x3a4458, sw: 1, r: 2 * u });
    }
    d.testo(String(t.inst), px + 46 * u + 5 * (cas + 2 * u) + 4 * u, y - 1 * u, 14, COL.testo, { bold: true });
    // chi controlla
    const ctl = t.controllo === 'io' ? 'Controlli tu' : t.controllo === 'avv' ? 'Controlla lui' : 'Nessuno';
    d.testo(ctl, px + pw, y, 11, t.controllo === null ? COL.tenue : mioCtl ? COL.valido : COL.pericolo, { anchorX: 1, bold: true });
    y += 17 * u;
    // presenze avversarie
    const hP = Math.max(24 * u, Math.min(40 * u, (hMid - 108 * u) / 2));
    const presenze = (lista: VistaPresenza[], yy: number, mie: boolean) => {
      const n = 4;
      const gap = 3 * u;
      const w1 = (pw - gap * (n - 1)) / n;
      lista.forEach((p, k) => {
        const px1 = px + k * (w1 + gap);
        const col = colori(p.id);
        const bersaglio = opz.pres.includes(p.uid);
        d.rett(px1, yy, w1, hP, col.scuro, {
          stroke: bersaglio ? COL.valido : col.chiaro, sw: bersaglio ? 3.5 : 1.2, id: `pres:${p.uid}`,
          tap: () => { if (bersaglio) { c.scegliPresenza(p.uid); az.rerender(); } else az.grande({ tipo: 'carta', id: p.id, trasformata: p.trasformata }); },
          over: () => az.zoom({ id: p.id, trasformata: p.trasformata }), out: () => az.zoom(null),
        });
        d.adatta(p.nome, px1 + 2 * u, yy + 2 * u, w1 - 4 * u, hP - 16 * u, 10.5, 8.5, COL.testo, false, 'center');
        d.testo(String(p.forza), px1 + w1 - 3 * u, yy + hP - 15 * u, 13, COL.oro, { bold: true, anchorX: 1 });
        if (p.trasformata) d.testo('✦', px1 + 3 * u, yy + hP - 15 * u, 11, 0xd08cff);
      });
      if (!lista.length) d.testo(mie ? 'le tue presenze' : 'presenze avversarie', px, yy + hP / 2 - 6 * u, 10, 0x59627a);
    };
    presenze(t.loro, y, false);
    y += hP + 3 * u;
    // forze e tappe: Lui a sinistra, Tu a destra; la tappa e' piena se al sicuro (consolidata), vuota se si puo' ancora togliere
    const hF = 30 * u;
    d.rett(px, y, pw, hF, 0x0f131b, { stroke: 0x2c3444, r: 4 * u });
    d.testo(`Lui ${t.forzaLoro}`, px + 6 * u, y + 7 * u, 14, cAvv.chiaro, { bold: true });
    d.testo(`Tu ${t.forzaMia}`, px + pw - 6 * u, y + 7 * u, 14, colori(v.fazione === 'custodi' ? 'CU' : 'RI').chiaro, { bold: true, anchorX: 1 });
    const sigillo = v.fazione === 'custodi' ? 'Sigillo' : 'Rito';
    const sigilloAvv = v.fazioneAvv === 'custodi' ? 'Sigillo' : 'Rito';
    const colW = (pw - 96 * u) / 2;
    const tappaBox = (x0: number, ha: boolean, togl: boolean, nome: string, col: number, sicuro: string): void => {
      const ic = new Graphics();
      const cx0 = x0 + 6 * u;
      const cy0 = y + 9 * u;
      if (!ha) ic.circle(cx0, cy0, 4 * u).stroke({ width: 1, color: 0x59627a });
      else if (togl) ic.circle(cx0, cy0, 4.5 * u).stroke({ width: 2, color: col });
      else ic.circle(cx0, cy0, 4.5 * u).fill(col).stroke({ width: 1, color: 0xffffff });
      s.addChild(ic);
      if (!ha) { d.testo('nessuna tappa', x0 + 14 * u, y + 4 * u, 8.5, 0x59627a); return; }
      d.testo(nome, x0 + 14 * u, y + 2 * u, 10, col, { bold: true });
      d.adatta(togl ? sicuro : 'al sicuro', x0 + 3 * u, y + 15 * u, colW - 4 * u, 12 * u, 8.5, 7, togl ? COL.oro : COL.tenue, false, 'left');
    };
    tappaBox(px + 46 * u, t.loroTappa, t.loroTappaTogliibile, `${sigilloAvv} di Lui`, COL.pericolo, 'al sicuro dopo il tuo turno');
    tappaBox(px + 46 * u + colW + 4 * u, t.mioTappa, t.mioTappaTogliibile, `${sigillo} tuo`, COL.valido, 'al sicuro dopo il turno di Lui');
    y += hF + 3 * u;
    presenze(t.mie, y, true);
    y += hP + 3 * u;
    // pulsante tappa: pieno e illuminato quando si puo' usare; spento, con il motivo in piccolo, quando no
    const puo = c.puoTappa(i);
    if (y + 20 * u <= yMid + hMid) {
      const nomeBtn = v.fazione === 'custodi' ? 'Poni Sigillo' : 'Completa rito';
      const hb = Math.min(24 * u, yMid + hMid - y - 3 * u);
      if (puo) d.rett(px - 2 * u, y - 2 * u, pw + 4 * u, hb + 4 * u, 0x6ee7a1, { alpha: 0.28, r: 7 * u });
      const motivo = puo ? null : motivoTappa(v, t);
      d.bottone(`btn:tappa:${i}`, puo ? `${nomeBtn} (${t.costoTappa})` : motivo ? `${nomeBtn}: ${motivo}` : nomeBtn, px, y, pw, hb, puo, () => { c.tappa(i); az.rerender(); }, 0x2a9d55, puo ? 12 : 9.5);
    }
  });

  // ---------- parte bassa: mano e controlli ----------
  d.rett(m, yBot, W - 2 * m, hBottom - m, COL.pannello, { stroke: COL.bordo });
  const colMia = colori(v.fazione === 'custodi' ? 'CU' : 'RI');
  const wCtl = Math.max(170 * u, 0.2 * W);
  const handX = 2 * m;
  const handW = W - 2 * m - wCtl - 3 * m;
  const n = v.mano.length;
  const cw = Math.max(50 * u, Math.min(104 * u, (handW - 4 * u * (n - 1)) / Math.max(1, n)));
  const passo = n > 1 ? Math.min(cw + 4 * u, (handW - cw) / (n - 1)) : 0;
  const chH = hBottom - 2 * m - 18 * u;
  d.testo(`LA TUA MANO · ${NOME_FAZ[v.fazione]}`, handX, yBot + 3 * u, 11, colMia.chiaro, { bold: true });
  v.mano.forEach((cd, k) => {
    const x = handX + k * passo;
    const scelta = sel.carta === cd.uid;
    const giocabile = c.giocabile(cd.uid);
    const col = colori(cd.id);
    const y = yBot + 18 * u - (scelta ? 8 * u : 0);
    d.rett(x, y, cw, chH, giocabile ? col.scuro : 0x15181f, {
      stroke: scelta ? COL.selezione : giocabile ? col.chiaro : 0x2c3444, sw: scelta ? 3.5 : 1.5, id: `mano:${cd.uid}`,
      tap: () => { if (scelta || giocabile) { c.scegliCarta(cd.uid); az.rerender(); } else az.motivo(cd.uid); },
      over: () => az.zoom({ id: cd.id, trasformata: cd.trasformata }), out: () => az.zoom(null),
    });
    // illustrazione, poi nome, poi tipo e forza
    const aw = cw - 6 * u;
    const ah = Math.min(aw * 0.75, chH * 0.5);
    const conImg = d.immagine(idImmagine(cd.id, cd.trasformata), x + 3 * u, y + 3 * u, aw, ah, giocabile ? 1 : 0.5);
    if (!conImg) d.rett(x + 3 * u, y + 3 * u, aw, ah, col.chiaro, { alpha: 0.18, r: 3 * u });
    d.rett(x + 3 * u, y + 3 * u, 20 * u, 20 * u, 0x0d1015, { stroke: COL.oro, r: 10 * u, alpha: 0.9 });
    d.testo(String(cd.costo), x + 13 * u, y + 5 * u, 13, COL.oro, { bold: true, anchorX: 0.5 });
    if (cd.potente) d.testo('⚡' + (cd.potente > 1 ? cd.potente : ''), x + cw - 5 * u, y + 5 * u, 11, 0xffb070, { anchorX: 1, bold: true });
    if (cd.trasformata) d.testo('✦', x + cw - 5 * u, y + ah - 12 * u, 10, 0xd08cff, { anchorX: 1 });
    d.adatta(cd.nome, x + 3 * u, y + ah + 5 * u, cw - 6 * u, chH - ah - 26 * u, 11, 8, giocabile ? COL.testo : 0x7c8596, true, 'center');
    d.testo(cd.tipo === 'presenza' ? 'Presenza' : 'Azione', x + 4 * u, y + chH - 16 * u, 9.5, giocabile ? COL.tenue : 0x59627a);
    if (cd.tipo === 'presenza') d.testo(String(cd.forza), x + cw - 5 * u, y + chH - 20 * u, 15, COL.oro, { bold: true, anchorX: 1 });
    // lente: apre la carta ingrandita senza giocarla
    const lx = x + cw - 24 * u;
    const ly = y + ah - 22 * u;
    d.rett(lx, ly, 22 * u, 22 * u, 0x0d1015, { stroke: 0xcfd8ea, sw: 1.2, r: 11 * u, alpha: 0.85, id: `lente:${cd.uid}`, tap: () => az.grande({ tipo: 'carta', id: cd.id, trasformata: cd.trasformata }) });
    const lente = new Graphics();
    lente.circle(lx + 10 * u, ly + 10 * u, 4.5 * u).stroke({ width: 1.6, color: 0xcfd8ea });
    lente.moveTo(lx + 13.5 * u, ly + 13.5 * u).lineTo(lx + 17 * u, ly + 17 * u).stroke({ width: 1.8, color: 0xcfd8ea });
    d.s.addChild(lente);
  });

  d.aree['mano:tutta'] = { x: m, y: yBot, w: W - 2 * m - wCtl - 2 * m, h: hBottom - m };
  d.aree['territori:tutti'] = { x: m, y: yMid, w: W - 2 * m, h: hMid };
  // pannello di controllo a destra
  const cxp = W - m - wCtl - m;
  d.testo(`Energia ${v.energia}`, cxp + 6 * u, yBot + 3 * u, 18, COL.oro, { bold: true });
  d.testo(`Esposizione ${v.esposizione}/10`, cxp + 6 * u, yBot + 26 * u, 12, v.esposizione >= 6 ? COL.pericolo : COL.testo, { bold: true });
  d.testo(`Tappe ${v.tappe}/3   Mazzo ${v.nMazzo}`, cxp + 6 * u, yBot + 43 * u, 12, COL.testo);
  d.aree['pannello:energia'] = { x: cxp, y: yBot, w: wCtl, h: 58 * u };
  const bw = wCtl - 8 * u;
  const bh = Math.min(26 * u, (hBottom - 2 * m - 62 * u) / 3 - 3 * u);
  let by = yBot + 60 * u;
  const tuo = c.tuoTurno && !c.decisione;
  if (opz.pronta) {
    d.bottone('btn:gioca', 'Gioca la carta', cxp + 4 * u, by, bw, bh, true, () => { c.giocaSelezionata(); az.rerender(); }, 0x2f5a3a);
  } else {
    d.bottone('btn:fine', c.tuoTurno ? 'Fine turno' : 'Turno del computer…', cxp + 4 * u, by, bw, bh, tuo, () => { c.fine(); az.rerender(); }, 0x5a3a2a);
  }
  by += bh + 3 * u;
  const hw = (bw - 3 * u) / 2;
  d.bottone('btn:riduci', 'Riduci esp. (2)', cxp + 4 * u, by, hw, bh, c.puoRidurre(), () => { c.riduci(); az.rerender(); }, 0x2d3b55, 10.5);
  d.bottone('btn:annulla', sel.carta !== undefined ? 'Annulla' : 'Regole', cxp + 4 * u + hw + 3 * u, by, hw, bh, true, () => { if (sel.carta !== undefined) { c.annulla(); az.rerender(); } else az.regole(true); }, 0x2d3b55, 10.5);
  by += bh + 3 * u;
  d.bottone('btn:copia', ui.copiato || 'Copia il registro', cxp + 4 * u, by, bw, bh, true, () => az.copia(), 0x2d3b55, 11);

  // ---------- sovrapposizioni ----------
  const modale = opz.cerca.length > 0 || !!c.decisione || !!c.evento || ui.regole || c.finita || !!ui.grande;
  if (ui.zoom && !modale) zoomCarta(d, c, ui.zoom, W, yMid);
  if (ui.zoomTerr !== null && !ui.zoom && !modale) zoomTerritorio(d, c, ui.zoomTerr, W, yMid);
  if (opz.cerca.length) sceltaCerca(d, c, opz.cerca, W, H, az);
  const dec = c.decisione;
  if (dec) riordinoBiblioteca(d, c, dec.uids, ui, W, H, az);
  if (ui.grande && !c.evento) vistaGrande(d, c, ui.grande, W, H, az);
  if (c.evento) eventoCosmico(d, c, W, H, az);
  if (ui.regole) pannelloRegole(d, W, H, az);
  if (c.finita) fineAPartita(d, c, W, H, az);
  if (ui.tutorial && !c.finita) tutorialSovrapposto(d, passiTutorial(v.fazione)[ui.tutorial.passo], ui.tutorial.passo, W, H, az);
  fuori = s.children
    .filter((x): x is Text => x instanceof Text)
    .filter((x) => {
      const b = x.getBounds();
      return b.x < -1 || b.y < -1 || b.x + b.width > W + 1 || b.y + b.height > H + 1;
    })
    .map((x) => x.text);
  return d.aree;
}

let fuori: string[] = [];
/** Testi che sforano lo schermo nell'ultimo disegno (serve ai test automatici). */
export function testiFuoriSchermo(): string[] {
  return fuori;
}

function riquadroCentrale(d: Disegno, W: number, H: number, w: number, h: number, bordo = 0x8aa0c8): { x: number; y: number; w: number; h: number } {
  d.rett(0, 0, W, H, 0x000000, { r: 0, alpha: 0.62, id: 'velo', tap: () => undefined });
  const x = (W - w) / 2;
  const y = (H - h) / 2;
  d.rett(x, y, w, h, 0x161b26, { stroke: bordo, sw: 2.5 });
  return { x, y, w, h };
}

function sfondoDietro(d: Disegno, indice: number, x: number, y: number, w: number, h: number, bordo: number): void {
  const g = new Graphics();
  g.roundRect(x, y, w, h, 6 * d.u).fill({ color: 0x161b26 }).stroke({ width: 2.5, color: bordo });
  d.s.addChildAt(g, indice);
}

function zoomCarta(d: Disegno, c: Controller, z: ZoomInfo, W: number, hTop: number): void {
  const e = carta(c.cat, z.id, z.trasformata);
  const u = d.u;
  const w = Math.min(330 * u, W * 0.4);
  const x = W / 2 - w / 2;
  const y = hTop + 6 * u;
  const col = colori(z.id);
  const primo = d.s.children.length;
  d.testo(e.nome + (z.trasformata ? '  ✦ cosmica' : ''), x + 8 * u, y + 6 * u, 14, 0xffffff, { bold: true, w: w - 16 * u });
  let yy = y + 26 * u;
  const tipo = `${e.tipo === 'presenza' ? 'Presenza' : 'Azione'} · costo ${e.costo}` + (e.tipo === 'presenza' ? ` · forza ${e.forza}` : '') + (e.potente ? ` · potente (+${e.potente} esposizione)` : '');
  d.testo(tipo, x + 8 * u, yy, 11, COL.oro, { w: w - 16 * u });
  yy += 18 * u;
  const eff = d.testo(e.effetto || '(nessun effetto)', x + 8 * u, yy, 12, COL.testo, { w: w - 16 * u });
  yy += eff.height + 8 * u;
  const cit = d.testo('«' + e.citazione.testo + '»', x + 8 * u, yy, 11, 0xc8b88a, { w: w - 16 * u });
  yy += cit.height + 2 * u;
  const fonte = d.testo('— ' + e.citazione.fonte, x + 8 * u, yy, 10, COL.tenue, { w: w - 16 * u });
  yy += fonte.height + 8 * u;
  sfondoDietro(d, primo, x, y, w, yy - y, col.chiaro);
}

function zoomTerritorio(d: Disegno, c: Controller, i: number, W: number, hTop: number): void {
  const u = d.u;
  const t = c.cat.dati.territori[i];
  const w = Math.min(340 * u, W * 0.42);
  const x = W / 2 - w / 2;
  const y = hTop + 6 * u;
  const primo = d.s.children.length;
  d.testo(t.nome, x + 8 * u, y + 6 * u, 14, 0xffffff, { bold: true, w: w - 16 * u });
  const a = d.testo(t.effetto, x + 8 * u, y + 26 * u, 12, COL.testo, { w: w - 16 * u });
  const b = d.testo('Riserva: ' + t.riserva[0].nome + ' (' + t.riserva[0].copie + ' carte)', x + 8 * u, y + 30 * u + a.height, 11, COL.oro, { w: w - 16 * u });
  sfondoDietro(d, primo, x, y, w, 40 * u + a.height + b.height, 0x8aa0c8);
}

function sceltaCerca(d: Disegno, c: Controller, ids: string[], W: number, H: number, az: Azioni): void {
  const u = d.u;
  const w = Math.min(360 * u, W * 0.7);
  const bh = 24 * u;
  const h = 40 * u + ids.length * (bh + 4 * u);
  const r = riquadroCentrale(d, W, H, w, Math.min(h, H - 20 * u));
  d.testo('Pagina del Necronomicon: scegli una carta azione dal mazzo', r.x + 10 * u, r.y + 8 * u, 12, COL.oro, { bold: true, w: w - 20 * u });
  ids.forEach((id, k) => {
    d.bottone(`cerca:${id}`, carta(c.cat, id, false).nome, r.x + 10 * u, r.y + 34 * u + k * (bh + 4 * u), w - 20 * u, bh, true, () => { c.scegliCerca(id); az.rerender(); }, 0x2d3b55, 12);
  });
}

function riordinoBiblioteca(d: Disegno, c: Controller, uids: number[], ui: UiStato, W: number, H: number, az: Azioni): void {
  const u = d.u;
  const w = Math.min(560 * u, W * 0.9);
  const h = Math.min(190 * u, H - 20 * u);
  const r = riquadroCentrale(d, W, H, w, h);
  d.testo('Biblioteca della Miskatonic: guarda le prime 3 carte del mazzo e riordinale', r.x + 10 * u, r.y + 8 * u, 12, COL.oro, { bold: true, w: w - 20 * u });
  d.testo('Tocca le carte nell\'ordine in cui vuoi pescarle (la prima toccata sarà la prossima).', r.x + 10 * u, r.y + 26 * u, 11, COL.tenue, { w: w - 20 * u });
  const cw = (w - 40 * u) / 3;
  const ch = h - 90 * u;
  uids.forEach((uid, k) => {
    const pos = ui.ordine.indexOf(uid);
    d.rett(r.x + 10 * u + k * (cw + 10 * u), r.y + 50 * u, cw, ch, pos >= 0 ? 0x2f5a3a : 0x1f2735, {
      stroke: pos >= 0 ? COL.valido : 0x8aa0c8, id: `riordina:${uid}`, tap: () => az.ordine(uid),
    });
    d.adatta(c.nomeCarta(uid), r.x + 14 * u + k * (cw + 10 * u), r.y + 56 * u, cw - 8 * u, ch - 24 * u, 13, 9, 0xffffff, true, 'center');
    if (pos >= 0) d.testo(`${pos + 1}ª`, r.x + 10 * u + k * (cw + 10 * u) + cw / 2, r.y + 50 * u + ch - 22 * u, 15, COL.valido, { bold: true, anchorX: 0.5 });
  });
  d.bottone('btn:tieni', 'Tieni l\'ordine', r.x + 10 * u, r.y + h - 30 * u, 140 * u, 24 * u, true, () => az.ordine('tieni'), 0x2d3b55, 12);
  d.bottone('btn:azzera', 'Ricomincia', r.x + 160 * u, r.y + h - 30 * u, 110 * u, 24 * u, ui.ordine.length > 0, () => az.ordine('azzera'), 0x2d3b55, 12);
}

function misura(d: Disegno, t: string, size: number, w: number): number {
  const tx = d.testo(t, 0, 0, size, 0xffffff, { w });
  const h = tx.height;
  d.s.removeChild(tx);
  tx.destroy();
  return h;
}

/** Scheda grande: illustrazione a sinistra, testi a destra. Un tocco ovunque la chiude. */
function schedaGrande(d: Disegno, W: number, H: number, bordo: number, sopra: string, titolo: string, riga: string, effetto: string, cit: { testo: string; fonte: string; originale?: string }, idImg: string, chiudi: () => void, id: string, nota = ''): void {
  const u = d.u;
  d.rett(0, 0, W, H, 0x000000, { r: 0, alpha: 0.7, id: 'velo', tap: chiudi });
  const bw = Math.min(W - 12 * u, 920 * u);
  const bh = Math.min(H - 12 * u, 420 * u);
  const x = (W - bw) / 2;
  const y = (H - bh) / 2;
  d.rett(x, y, bw, bh, 0x161b26, { stroke: bordo, sw: 3, id, tap: chiudi });
  const aw = Math.min(bw * 0.46, (bh - 24 * u) * (4 / 3));
  const ah = aw * 0.75;
  const ay = y + (bh - ah) / 2;
  if (!d.immagine(idImg, x + 10 * u, ay, aw, ah)) d.rett(x + 10 * u, ay, aw, ah, bordo, { alpha: 0.2 });
  d.rett(x + 10 * u, ay, aw, ah, 0xffffff, { alpha: 0.0, stroke: bordo, sw: 2, r: 4 * u });
  const tx = x + aw + 24 * u;
  const tw = bw - aw - 36 * u;
  let ty = y + 10 * u;
  if (sopra) { d.testo(sopra, tx, ty, 11, bordo, { bold: true }); ty += 18 * u; }
  const t = d.testo(titolo, tx, ty, 20, 0xffffff, { bold: true, w: tw });
  ty += t.height + 4 * u;
  const r1 = d.testo(riga, tx, ty, 12, COL.oro, { w: tw });
  ty += r1.height + 8 * u;
  const ef = d.testo(effetto || '(nessun effetto)', tx, ty, 14, COL.testo, { w: tw });
  ty += ef.height + 12 * u;
  const ci = d.testo('«' + cit.testo + '»', tx, ty, 13, 0xd8c690, { w: tw });
  ty += ci.height + 3 * u;
  const fo = d.testo('— ' + cit.fonte, tx, ty, 11, COL.tenue, { w: tw });
  ty += fo.height + 4 * u;
  if (cit.originale) {
    const o = d.testo(cit.originale, tx, ty, 9.5, 0x6f7a8e, { w: tw });
    ty += o.height + 4 * u;
  }
  if (nota) d.testo(nota, tx, ty + 4 * u, 10.5, COL.oro, { w: tw });
  d.testo('Tocca per chiudere', x + bw - 10 * u, y + bh - 16 * u, 10, COL.tenue, { anchorX: 1 });
}

function vistaGrande(d: Disegno, c: Controller, g: NonNullable<UiStato['grande']>, W: number, H: number, az: Azioni): void {
  const chiudi = () => az.grande(null);
  if (g.tipo === 'carta') {
    const e = carta(c.cat, g.id, g.trasformata);
    const col = colori(g.id);
    const def = c.cat.carte.get(g.id)!;
    const riga = `${e.tipo === 'presenza' ? 'Presenza' : 'Azione'} · costo ${e.costo}` + (e.tipo === 'presenza' ? ` · forza ${e.forza}` : '') + (e.potente ? ` · potente (+${e.potente} esposizione)` : '') + (g.trasformata ? ' · versione cosmica ✦' : '');
    const cosm = !g.trasformata && def.versione_cosmica ? `Versione cosmica: ${def.versione_cosmica.nome}` : '';
    schedaGrande(d, W, H, col.chiaro, '', e.nome, riga, e.effetto, e.citazione, idImmagine(g.id, g.trasformata), chiudi, 'grande:chiudi', cosm);
  } else {
    const t = c.cat.dati.territori[g.i];
    const r = t.riserva[0];
    schedaGrande(d, W, H, 0x8aa0c8, 'TERRITORIO', t.nome, `Carta della riserva: ${r.nome} (${r.copie} copie)`, t.effetto, t.citazione, t.id, chiudi, 'grande:chiudi', `Riserva: ${r.effetto}`);
  }
}

function eventoCosmico(d: Disegno, c: Controller, W: number, H: number, az: Azioni): void {
  const e = c.evento!;
  schedaGrande(d, W, H, 0xb06cff, 'EVENTO COSMICO', e.nome, e.tipo === '?' ? 'evento improvviso' : `tipo: ${NOME_TIPO_EVENTO[e.tipo] ?? e.tipo}`, e.effetto, c.cat.eventi.get(e.id)!.citazione, e.id, () => az.chiudiEvento(), 'evento:chiudi');
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
    'Fine partita: «Copia il registro» per mandarlo a chi analizza le partite. Tocca per chiudere.',
  ];
  let y = r.y + 8 * u;
  righe.forEach((riga, i) => {
    const t = d.testo(riga, r.x + 12 * u, y, i === 0 ? 14 : 11.5, i === 0 ? COL.oro : COL.testo, { bold: i === 0, w: w - 24 * u });
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
  d.testo(titolo, r.x + w / 2, r.y + 12 * u, 26, col, { bold: true, anchorX: 0.5 });
  const vinc = s.vincitore === null ? 'Nessun vincitore' : 'Vittoria ' + (s.giocatori[s.vincitore].fazione === 'custodi' ? 'dei Custodi' : 'dei Risvegliati');
  d.testo(`${vinc} · ${s.giro} giri · seme ${s.seme}`, r.x + w / 2, r.y + 52 * u, 13, COL.testo, { anchorX: 0.5 });
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
  const hT = misura(d, passo.testo, 12.5, bw - 20 * u);
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
  d.testo(`${indice + 1}/6  ${passo.titolo}`, bx + 10 * u, by + 8 * u, 14, COL.oro, { bold: true });
  d.testo(passo.testo, bx + 10 * u, by + 30 * u, 12.5, 0xffffff, { w: bw - 20 * u });
  const ultimo = indice === 5;
  d.bottone('tut:avanti', ultimo ? 'Fine' : 'Avanti', bx + bw - 100 * u, by + bh - 30 * u, 90 * u, 24 * u, true, () => az.tutorial('avanti'), 0x2a9d55, 12);
  if (!ultimo) d.bottone('tut:salta', 'Salta', bx + bw - 196 * u, by + bh - 30 * u, 90 * u, 24 * u, true, () => az.tutorial('salta'), 0x2d3b55, 12);
}
