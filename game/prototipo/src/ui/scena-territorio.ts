// Dentro un territorio: la scena 3D del luogo a tutto schermo, con le carte dell'avversario (a sinistra) e le tue (a destra) in grande,
// le forze, l'instabilita', la tappa e i bottoni. Nessuna regola: numeri dalla vista, azioni dal controller.
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { altezzaCarta, cartaGrande, cartaRidotta, datiDaCarta } from './carte.js';
import { SETTORI, type Settore } from './config-plancia.js';
import type { Controller } from './controller.js';
import { COL, Disegno, texturaGradiente } from './disegno.js';
import { texturaScena } from './immagini.js';
import type { Azioni, UiStato } from './scena.js';
import { aloneLuce, anim } from './animazioni.js';
import { cosaManca, motivoTappa } from './suggerimento.js';
import type { VistaPresenza } from '../motore/vista.js';

let vignetta: Texture | undefined;
function texturaVignetta(): Texture {
  if (vignetta) return vignetta;
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext('2d')!;
  ctx.translate(128, 64);
  ctx.scale(1, 0.5);
  const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 150);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(5,4,3,0.8)');
  ctx.fillStyle = g;
  ctx.fillRect(-128, -128, 256, 256);
  vignetta = Texture.from(cv);
  return vignetta;
}

const COL_FAZ: Record<string, number> = { custodi: 0x9cc4f5, risvegliati: 0xa9dcb6 };
const NOME_FAZ: Record<string, string> = { custodi: 'I CUSTODI', risvegliati: 'I RISVEGLIATI' };

export function settoreCorrente(ui: UiStato): Settore | undefined {
  return SETTORI.find((s) => s.id === ui.scena);
}

export function disegnaTerritorio(d: Disegno, c: Controller, ui: UiStato, az: Azioni, W: number, H: number): void {
  const u = d.u;
  const st = settoreCorrente(ui)!;
  const idx = SETTORI.indexOf(st);
  const i = st.territorioId ? c.cat.dati.territori.findIndex((t) => t.id === st.territorioId) : -1;
  const v = c.vista();
  const t = i >= 0 ? v.territori[i] : null;
  const opz = c.opzioni();
  const sel = c.selezione;

  // ---------- sfondo: la scena 3D, un po' scurita, con i lati piu' scuri ----------
  d.rett(0, 0, W, H, 0x120d09, { r: 0 });
  const tex = texturaScena(st.scena);
  if (tex) {
    const k = Math.max(W / tex.width, H / tex.height);
    const sp = new Sprite(tex);
    sp.scale.set(k);
    sp.x = (W - tex.width * k) / 2;
    sp.y = (H - tex.height * k) / 2;
    sp.tint = 0xd9d9d9;
    d.s.addChild(sp);
  } else {
    d.testo('Caricamento della scena…', W / 2, H / 2, 14, COL.tenue, { anchorX: 0.5, anchorY: 0.5, corsivo: true });
  }
  // candele, lanterne e bagliori della scena (si animano)
  if (tex && st.luci) {
    const k = Math.max(W / tex.width, H / tex.height);
    const ox = (W - tex.width * k) / 2;
    const oy = (H - tex.height * k) / 2;
    const colori = { candela: 0xffa040, viola: 0xb070ff, verde: 0x40ffa8 } as const;
    for (const l of st.luci) {
      const dd = l.d * tex.width * k;
      const sp = aloneLuce(d, ox + l.x * tex.width * k, oy + l.y * tex.height * k, dd, dd, colori[l.tipo]);
      anim.luce(sp, l.tipo === 'candela' ? 'candela' : 'pulsa', { min: l.tipo === 'candela' ? 0.3 : 0.15, max: l.tipo === 'candela' ? 0.8 : 0.5, periodo: l.tipo === 'candela' ? 900 : 3400 });
    }
  }
  const vg = new Sprite(texturaVignetta());
  vg.width = W;
  vg.height = H;
  d.s.addChild(vg);

  // ---------- barra in alto: indietro, nome, effetto, luoghi ----------
  const hBar = 52 * u;
  d.rett(0, 0, W, hBar, 0, { r: 0, alpha: 0.9, tex: gradBarra() });
  const rb = 17 * u;
  d.cerchio(16 * u + rb, hBar / 2, rb, 0x140e08, { stroke: COL.oroScuro, sw: 1.2, alpha: 0.9 });
  const fr = new Graphics();
  fr.moveTo(16 * u + rb + 3 * u, hBar / 2 - 7 * u).lineTo(16 * u + rb - 4 * u, hBar / 2).lineTo(16 * u + rb + 3 * u, hBar / 2 + 7 * u).stroke({ width: 2.4, color: COL.inciso });
  d.s.addChild(fr);
  d.rett(16 * u, hBar / 2 - rb, 2 * rb, 2 * rb, 0xffffff, { alpha: 0.001, r: rb, id: 'scena:indietro', tap: () => az.esci() });
  const xNome = 16 * u + 2 * rb + 14 * u;
  const nome = d.testo(st.nome.toUpperCase(), xNome, hBar / 2, 22, COL.inciso, { titoli: true, bold: true, peso: '900', ls: 1, anchorY: 0.5 });
  nome.y = hBar / 2;
  // luoghi (pallini) con le frecce per passare al vicino
  const wDots = 5 * 16 * u;
  const xDots = W - 16 * u - 28 * u - wDots - 28 * u;
  const frecce = (id: string, dir: -1 | 1, cx: number): void => {
    const ok = idx + dir >= 0 && idx + dir < SETTORI.length;
    d.cerchio(cx, hBar / 2, 12 * u, 0x140e08, { stroke: ok ? COL.oroScuro : 0x3a3326, sw: 1, alpha: 0.85 });
    const g = new Graphics();
    g.moveTo(cx - dir * 3 * u, hBar / 2 - 5 * u).lineTo(cx + dir * 3 * u, hBar / 2).lineTo(cx - dir * 3 * u, hBar / 2 + 5 * u).stroke({ width: 2, color: ok ? COL.inciso : 0x5a5240 });
    d.s.addChild(g);
    if (ok) d.rett(cx - 14 * u, hBar / 2 - 14 * u, 28 * u, 28 * u, 0xffffff, { alpha: 0.001, r: 14 * u, id, tap: () => az.vicino(dir) });
  };
  frecce('scena:vicino:-1', -1, xDots - 16 * u);
  frecce('scena:vicino:1', 1, xDots + wDots + 16 * u - 8 * u);
  SETTORI.forEach((s, k) => {
    const attivo = k === idx;
    const col = s.id === 'rlyeh' ? 0xb48ae6 : 0xf3e3b6;
    d.cerchio(xDots + 8 * u + k * 16 * u, hBar / 2, 5 * u, col, { alpha: attivo ? 1 : 0.32 });
  });
  const larghEffetto = xDots - 40 * u - (xNome + nome.width + 14 * u);
  const effetto = t ? c.cat.dati.territori[i].effetto : 'Non ancora in gioco: si può guardare la scena, ma qui non si gioca.';
  if (larghEffetto > 80 * u) d.adatta(effetto, xNome + nome.width + 14 * u, 7 * u, larghEffetto, hBar - 12 * u, 14, 10, 0xd8cfb8, false, 'left', { corsivo: true });

  // ---------- luogo non ancora in gioco: solo la scena ----------
  if (!t) {
    const w = Math.min(360 * u, W - 40 * u);
    d.rett((W - w) / 2, H - 84 * u, w, 52 * u, 0x0a0704, { alpha: 0.82, stroke: COL.oroScuro, sw: 1.2, r: 8 * u });
    d.testo('NON ANCORA IN GIOCO', W / 2, H - 78 * u, 14, COL.inciso, { titoli: true, bold: true, ls: 1, anchorX: 0.5 });
    d.testo('Scorri per vedere gli altri luoghi, o tocca la freccia per tornare alla plancia.', W / 2, H - 56 * u, 11.5, 0xcfc6b0, { anchorX: 0.5 });
    return;
  }

  // ---------- carte in grande ----------
  const nMax = Math.max(t.loro.length, t.mie.length, 1);
  const cw = Math.min(124 * u, (W / 2 - 40 * u - 8 * u * (nMax - 1)) / Math.max(nMax, 3.8));
  const ch = altezzaCarta(cw);
  const yLui = 88 * u;
  const yTu = H - 30 * u - ch - 4 * u;
  const colLui = COL_FAZ[v.fazioneAvv];
  const colTu = COL_FAZ[v.fazione];
  d.testo(`${NOME_FAZ[v.fazioneAvv]} · FORZA ${t.forzaLoro}`, 20 * u, 68 * u, 12, colLui, { titoli: true, bold: true, ls: 1 });
  d.testo(`${NOME_FAZ[v.fazione]} · TUA FORZA ${t.forzaMia}`, W - 20 * u, yTu - 20 * u, 12, colTu, { titoli: true, bold: true, ls: 1, anchorX: 1 });
  const fila = (lista: VistaPresenza[], y: number, daSinistra: boolean, mio: boolean): void => {
    const gap = 8 * u;
    const tot = lista.length ? lista.length * cw + Math.max(0, lista.length - 1) * gap : cw * 1.3;
    let x = daSinistra ? 20 * u : W - 20 * u - tot;
    if (!lista.length) {
      d.rett(x, y, cw * 1.3, 30 * u, 0x0a0704, { alpha: 0.6, r: 6 * u });
      d.testo(mio ? 'nessuna tua presenza' : 'nessuna presenza di Lui', x + cw * 0.65, y + 15 * u, 11, COL.tenue, { anchorX: 0.5, anchorY: 0.5, corsivo: true }).y = y + 15 * u;
      return;
    }
    for (const p of lista) {
      const bersaglio = opz.pres.includes(p.uid);
      const dati = { ...datiDaCarta(c, p.id, p.trasformata), forza: p.forza };
      cartaGrande(d, x, y, cw, dati, { evidenzia: bersaglio });
      d.rett(x, y, cw, ch, 0xffffff, {
        alpha: 0.001, r: 8 * u, id: `pres:${p.uid}`,
        tap: () => { if (c.opzioni().pres.includes(p.uid)) { c.scegliPresenza(p.uid); az.rerender(); } else az.grande({ tipo: 'carta', id: p.id, trasformata: p.trasformata }); },
        over: () => az.zoom({ id: p.id, trasformata: p.trasformata }), out: () => az.zoom(null),
      });
      x += cw + gap;
    }
  };
  fila(t.loro, yLui, true, false);
  fila(t.mie, yTu, false, true);

  // ---------- pannello a destra: forze, instabilita', tappa, bottoni ----------
  const pw = Math.min(250 * u, W * 0.3);
  const px = W - 20 * u - pw;
  let y = 62 * u;
  d.rett(px, y, pw, 54 * u, 0x0a0704, { alpha: 0.86, stroke: COL.oroScuro, sw: 1.2, r: 6 * u });
  const nL = d.testo(String(t.forzaLoro), px + 22 * u, y + 27 * u, 30, COL.lui, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 });
  nL.y = y + 27 * u;
  anim.numero(`t${i}:lui`, t.forzaLoro, nL);
  const nM = d.testo(String(t.forzaMia), px + pw - 22 * u, y + 27 * u, 30, COL.tu, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 });
  nM.y = y + 27 * u;
  anim.numero(`t${i}:mia`, t.forzaMia, nM);
  const cxp = px + pw / 2;
  for (let k = 1; k <= 5; k++) {
    const pieno = k <= t.inst;
    const col = pieno ? (k > 3 ? 0xe2553f : 0xe0a341) : 0xffffff;
    if (pieno) d.cerchio(cxp + (k - 3) * 14 * u, y + 17 * u, 8 * u, col, { alpha: 0.28 });
    d.cerchio(cxp + (k - 3) * 14 * u, y + 17 * u, 5 * u, col, { alpha: pieno ? 1 : 0.22 });
  }
  d.testo(`instabilità ${t.inst}`, cxp, y + 38 * u, 11.5, 0xcfc6b0, { anchorX: 0.5, anchorY: 0.5 }).y = y + 38 * u;
  y += 60 * u;
  // tappe
  const sigAvv = v.fazioneAvv === 'custodi' ? 'Sigillo' : 'Rito';
  const sigMio = v.fazione === 'custodi' ? 'Sigillo' : 'Rito';
  const tappa = (ha: boolean, togl: boolean, faz: string, testo: string, sicuro: string): void => {
    if (!ha) return;
    const col = faz === 'custodi' ? 0xb3301f : 0x2f8a4c;
    const luce = faz === 'custodi' ? 0xff7a62 : 0x9ff0b8;
    d.rett(px, y, pw, 26 * u, 0x0a0704, { alpha: 0.82, stroke: luce, sw: 1, r: 6 * u });
    d.punti[`disco:${i}:${faz === v.fazione ? 'mio' : 'loro'}`] = { x: px + 15 * u, y: y + 13 * u };
    if (togl) d.cerchio(px + 15 * u, y + 13 * u, 8 * u, 0x000000, { alpha: 0.4, stroke: luce, sw: 2 });
    else { d.cerchio(px + 15 * u, y + 13 * u, 10 * u, luce, { alpha: 0.25 }); d.cerchio(px + 15 * u, y + 13 * u, 8 * u, col, { stroke: luce, sw: 1 }); }
    d.adatta(togl ? `${testo}: ${sicuro}` : `${testo}: al sicuro`, px + 30 * u, y + 3 * u, pw - 36 * u, 20 * u, 12, 10, 0xe6dcc4, false, 'left');
    y += 30 * u;
  };
  tappa(t.loroTappa, t.loroTappaTogliibile, v.fazioneAvv, `${sigAvv} di Lui`, 'al sicuro dopo il tuo turno');
  tappa(t.mioTappa, t.mioTappaTogliibile, v.fazione, `${sigMio} tuo`, 'al sicuro dopo il turno di Lui');
  // cosa ti manca
  const manca = d.testo(cosaManca(t), px + pw, y, 12.5, 0xe6dcc4, { w: pw, align: 'right', anchorX: 1 });
  manca.x = px + pw;
  y += manca.height + 8 * u;
  // bottoni
  const nomeBtn = v.fazione === 'custodi' ? 'PONI SIGILLO' : 'COMPLETA RITO';
  if (sel.carta !== undefined) {
    const nc = v.mano.find((x) => x.uid === sel.carta)?.nome ?? '';
    const tc = d.riga(`Carta scelta: ${nc}`, px, y, pw, 12.5, COL.selezione, { bold: true });
    tc.x = px + pw - tc.width;
    y += 22 * u;
    if (opz.pronta) {
      const w1 = d.larghezza('GIOCA LA CARTA', 10.5, { titoli: true, bold: true, ls: 0.5 }) + 26 * u;
      d.pillolaOro('btn:gioca', 'GIOCA LA CARTA', px + pw - w1, y, 26 * u, () => { c.giocaSelezionata(); az.rerender(); });
      y += 32 * u;
    }
    const w2 = d.larghezza('ANNULLA', 10.5, { titoli: true, bold: true, ls: 0.5 }) + 26 * u;
    d.pillolaOro('btn:annulla', 'ANNULLA', px + pw - w2, y, 24 * u, () => { c.annulla(); az.rerender(); }, 10);
    if (opz.pres.length) d.testo('Tocca la carta bersaglio.', px + pw, y + 30 * u, 11.5, 0xe6dcc4, { anchorX: 1, corsivo: true });
  } else {
    const qui = c.carteGiocabiliIn(i);
    const et = 'GIOCA UNA CARTA QUI';
    const w1 = d.larghezza(et, 11.5, { titoli: true, bold: true, ls: 0.5 }) + 30 * u;
    const ok = qui.length > 0;
    d.rett(px + pw - w1, y, w1, 32 * u, 0, {
      r: 16 * u, tex: ok ? gradViola() : gradGrigio(), stroke: ok ? 0xb48ae6 : 0x4a4332, sw: 1.2, id: 'scena:gioca-qui', tap: ok ? () => az.manoQui(true) : undefined,
    });
    d.testo(et, px + pw - w1 / 2, y + 16 * u, 11.5, ok ? 0xeadcff : 0x7a7260, { titoli: true, bold: true, ls: 0.5, anchorX: 0.5, anchorY: 0.5 }).y = y + 16 * u;
    y += 38 * u;
    if (!ok) { d.testo(c.tuoTurno ? 'Nessuna carta si può giocare qui adesso.' : 'Turno di Lui: aspetta.', px + pw, y - 2 * u, 11, COL.tenue, { anchorX: 1, corsivo: true }); y += 16 * u; }
    const puo = c.puoTappa(i);
    if (puo) {
      const e2 = `${nomeBtn} · ${t.costoTappa}`;
      const w2 = d.larghezza(e2, 11, { titoli: true, bold: true, ls: 0.5 }) + 28 * u;
      d.pillolaOro(`btn:tappa:${i}`, e2, px + pw - w2, y, 28 * u, () => { c.tappa(i); az.rerender(); }, 11);
    } else {
      const motivo = motivoTappa(v, t);
      if (motivo) d.testo(`${v.fazione === 'custodi' ? 'Poni Sigillo' : 'Completa rito'}: ${motivo}`, px + pw, y, 11, COL.tenue, { anchorX: 1, w: pw, align: 'right' });
    }
  }

  // ---------- suggerimento in basso ----------
  const hint = 'Scorri per passare al territorio vicino · tocca la freccia o allarga con due dita per tornare alla plancia';
  const wh = Math.min(W - 30 * u, d.larghezza(hint, 11.5) + 28 * u);
  d.rett((W - wh) / 2, H - 24 * u, wh, 18 * u, 0x0a0704, { alpha: 0.7, r: 9 * u });
  d.testo(hint, W / 2, H - 15 * u, 11.5, 0xcfc6b0, { anchorX: 0.5, anchorY: 0.5 }).y = H - 15 * u;

  // ---------- mano: solo le carte che si possono giocare qui ----------
  if (ui.manoQui && sel.carta === undefined) manoQui(d, c, ui, az, v, i, W, H);
}

function manoQui(d: Disegno, c: Controller, ui: UiStato, az: Azioni, v: ReturnType<Controller['vista']>, i: number, W: number, H: number): void {
  void ui;
  const u = d.u;
  d.rett(0, 0, W, H, 0x000000, { alpha: 0.55, r: 0, id: 'scena:chiudi-mano', tap: () => az.manoQui(false) });
  const uids = c.carteGiocabiliIn(i);
  const cw = 98 * u;
  const chh = 138 * u;
  const gap = 12 * u;
  const tot = uids.length * cw + Math.max(0, uids.length - 1) * gap;
  const x0 = Math.max(10 * u, (W - tot) / 2);
  const y = H - chh - 24 * u;
  const titolo = 'Scegli la carta da giocare qui (tocca fuori per chiudere)';
  d.testo(titolo, W / 2, y - 24 * u, 13.5, COL.inciso, { titoli: true, bold: true, anchorX: 0.5 });
  uids.forEach((uid, k) => {
    const cd = v.mano.find((x) => x.uid === uid)!;
    const cont = new Container();
    cont.position.set(x0 + k * (cw + gap), y);
    d.s.addChild(cont);
    const dati = datiDaCarta(c, cd.id, cd.trasformata);
    cartaRidotta(cont, d, cw, chh, dati, { selezionata: false, giocabile: true });
    cont.eventMode = 'static';
    cont.cursor = 'pointer';
    cont.hitArea = new Rectangle(0, 0, cw, chh);
    cont.on('pointertap', () => az.giocaQui(uid));
    d.aree[`mano:${uid}`] = { x: x0 + k * (cw + gap) + cw * 0.2, y: y + 30 * u, w: cw * 0.4, h: 40 * u };
  });
}

const gradBarra = () => texturaGradiente([[0, 'rgba(10,7,4,0.95)'], [1, 'rgba(10,7,4,0)']], true);
const gradViola = () => texturaGradiente([[0, 'rgba(70,44,100,0.95)'], [1, 'rgba(36,20,56,0.95)']], true);
const gradGrigio = () => texturaGradiente([[0, 'rgba(40,36,28,0.9)'], [1, 'rgba(26,22,16,0.9)']], true);
