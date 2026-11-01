// Dentro un territorio: la scena 3D del luogo a tutto schermo, con le carte dell'avversario (a sinistra) e le tue (a destra) in grande,
// le forze, l'instabilita', la tappa e i bottoni. Nessuna regola: numeri dalla vista, azioni dal controller.
import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { altezzaCarta, cartaGrande, cartaRidotta, datiDaCarta } from './carte.js';
import { SETTORI, type Settore } from './config-plancia.js';
import type { Controller } from './controller.js';
import { COL, Disegno, pressioneLunga, pressioneRecente, texturaGradiente } from './disegno.js';
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
  d.rett(0, 0, W, hBar, 0, { r: 0, alpha: 0.94, tex: gradBarra() });
  const rb = 20 * u;
  d.cerchio(14 * u + rb, hBar / 2, rb, 0x140e08, { stroke: COL.oroScuro, sw: 1.4, alpha: 0.92 });
  const fr = new Graphics();
  fr.moveTo(14 * u + rb + 3.5 * u, hBar / 2 - 8 * u).lineTo(14 * u + rb - 4.5 * u, hBar / 2).lineTo(14 * u + rb + 3.5 * u, hBar / 2 + 8 * u).stroke({ width: 2.8, color: COL.inciso });
  d.s.addChild(fr);
  d.rett(14 * u, hBar / 2 - rb, 2 * rb, 2 * rb, 0xffffff, { alpha: 0.001, r: rb, id: 'scena:indietro', tap: () => az.esci() });
  const xNome = 14 * u + 2 * rb + 14 * u;
  const nome = d.testo(st.nome.toUpperCase(), xNome, hBar / 2, 22, COL.inciso, { titoli: true, bold: true, peso: '900', ls: 1, anchorY: 0.5 });
  nome.y = hBar / 2;
  // luoghi (pallini) con le frecce per passare al vicino
  const pitchD = 18 * u;
  const wDots = 5 * pitchD;
  const xDots = W - wDots - 48 * u;
  const frecce = (id: string, dir: -1 | 1, cx: number): void => {
    const ok = idx + dir >= 0 && idx + dir < SETTORI.length;
    d.cerchio(cx, hBar / 2, 15 * u, 0x140e08, { stroke: ok ? COL.oroScuro : 0x3a3326, sw: 1.2, alpha: 0.9 });
    const g = new Graphics();
    g.moveTo(cx - dir * 3.5 * u, hBar / 2 - 6 * u).lineTo(cx + dir * 3.5 * u, hBar / 2).lineTo(cx - dir * 3.5 * u, hBar / 2 + 6 * u).stroke({ width: 2.4, color: ok ? COL.inciso : 0x5a5240 });
    d.s.addChild(g);
    if (ok) d.rett(cx - 17 * u, hBar / 2 - 17 * u, 34 * u, 34 * u, 0xffffff, { alpha: 0.001, r: 17 * u, id, tap: () => az.vicino(dir) });
  };
  frecce('scena:vicino:-1', -1, xDots - 20 * u);
  frecce('scena:vicino:1', 1, xDots + wDots + 20 * u);
  SETTORI.forEach((s, k) => {
    const attivo = k === idx;
    const col = s.id === 'rlyeh' ? 0xb48ae6 : 0xf3e3b6;
    d.cerchio(xDots + pitchD / 2 + k * pitchD, hBar / 2, 5.5 * u, col, { alpha: attivo ? 1 : 0.32 });
  });
  const larghEffetto = xDots - 44 * u - (xNome + nome.width + 14 * u);
  const effetto = t ? c.cat.dati.territori[i].effetto : 'Non ancora in gioco: si può guardare la scena, ma qui non si gioca.';
  if (larghEffetto > 80 * u) d.adatta(effetto, xNome + nome.width + 14 * u, 6 * u, larghEffetto, hBar - 10 * u, 14, 12, 0xe6dcc4, false, 'left', { corsivo: true });

  // ---------- luogo non ancora in gioco: solo la scena ----------
  if (!t) {
    const w = Math.min(520 * u, W - 40 * u);
    d.rett((W - w) / 2, H - 92 * u, w, 66 * u, 0x070503, { alpha: 0.9, stroke: COL.oroScuro, sw: 1.2, r: 8 * u });
    d.testo('NON ANCORA IN GIOCO', W / 2, H - 86 * u, 15, COL.inciso, { titoli: true, bold: true, ls: 1, anchorX: 0.5 });
    d.testo('Scorri per vedere gli altri luoghi, o tocca la freccia per tornare alla plancia.', W / 2, H - 60 * u, 13, 0xe0d8c2, { anchorX: 0.5, w: w - 20 * u, align: 'center' });
    return;
  }

  // ---------- carte in grande: Lui a sinistra, tu a destra, ciascuno in un piccolo ventaglio ----------
  const infoW = Math.min(300 * u, W * 0.32);
  const zonaW = (W - infoW) / 2 - 14 * u;
  const zonaL = 10 * u;
  const zonaR = W - 10 * u - zonaW;
  const yEt = hBar + 8 * u;
  const yCarte = hBar + 34 * u;
  const cw = Math.min(162 * u, (H - yCarte - 36 * u) / (altezzaCarta(1)));
  const ch = altezzaCarta(cw);
  const colLui = COL_FAZ[v.fazioneAvv];
  const colTu = COL_FAZ[v.fazione];
  d.testo(`${NOME_FAZ[v.fazioneAvv]} · FORZA ${t.forzaLoro}`, zonaL + zonaW / 2, yEt, 13, colLui, { titoli: true, bold: true, ls: 1, anchorX: 0.5, bordo: { colore: 0x000000, spessore: 3 } });
  d.testo(`${NOME_FAZ[v.fazione]} · TUA FORZA ${t.forzaMia}`, zonaR + zonaW / 2, yEt, 13, colTu, { titoli: true, bold: true, ls: 1, anchorX: 0.5, bordo: { colore: 0x000000, spessore: 3 } });
  const fila = (lista: VistaPresenza[], zx: number, mio: boolean): void => {
    const n = lista.length;
    if (!n) {
      const w = Math.min(zonaW, cw * 1.3);
      d.rett(zx + (zonaW - w) / 2, yCarte + ch / 2 - 18 * u, w, 36 * u, 0x070503, { alpha: 0.72, r: 8 * u });
      d.testo(mio ? 'nessuna tua presenza' : 'nessuna presenza di Lui', zx + zonaW / 2, yCarte + ch / 2, 13, 0xd8d0ba, { anchorX: 0.5, anchorY: 0.5, corsivo: true }).y = yCarte + ch / 2;
      return;
    }
    const passo = n > 1 ? Math.min(cw + 10 * u, (zonaW - cw) / (n - 1)) : 0;
    let x = zx + (zonaW - (passo * (n - 1) + cw)) / 2;
    lista.forEach((p, k) => {
      const bersaglio = opz.pres.includes(p.uid);
      const dati = { ...datiDaCarta(c, p.id, p.trasformata), forza: p.forza };
      const apri = (): void => az.grande({ tipo: 'carta', id: p.id, trasformata: p.trasformata });
      cartaGrande(d, x, yCarte, cw, dati, { evidenzia: bersaglio });
      const g = d.rett(x, yCarte, cw, ch, 0xffffff, {
        alpha: 0.001, r: 8 * u, id: `pres:${p.uid}`,
        tap: () => {
          if (pressioneRecente()) return;
          if (c.opzioni().pres.includes(p.uid)) { c.scegliPresenza(p.uid); az.rerender(); } else apri();
        },
        over: () => az.zoom({ id: p.id, trasformata: p.trasformata }), out: () => az.zoom(null),
      });
      pressioneLunga(g, apri);
      // punto di tocco per i test: la parte della carta che resta scoperta (le carte si sovrappongono quando sono tante)
      d.aree[`pres:${p.uid}`] = { x, y: yCarte + ch * 0.12, w: k < n - 1 ? Math.max(passo * 0.9, 8 * u) : cw * 0.8, h: ch * 0.4 };
      x += passo;
    });
  };
  fila(t.loro, zonaL, false);
  fila(t.mie, zonaR, true);

  // ---------- al centro: forze, instabilita', tappe, cosa manca, bottoni ----------
  const pw = infoW;
  const px = (W - pw) / 2;
  let y = hBar + 10 * u;
  d.rett(px, y, pw, 82 * u, 0x070503, { alpha: 0.9, stroke: COL.oroScuro, sw: 1.2, r: 8 * u });
  const nL = d.testo(String(t.forzaLoro), px + 34 * u, y + 30 * u, 36, COL.lui, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5, bordo: { colore: 0x000000, spessore: 4 } });
  nL.y = y + 30 * u;
  anim.numero(`t${i}:lui`, t.forzaLoro, nL);
  const nM = d.testo(String(t.forzaMia), px + pw - 34 * u, y + 30 * u, 36, COL.tu, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5, bordo: { colore: 0x000000, spessore: 4 } });
  nM.y = y + 30 * u;
  anim.numero(`t${i}:mia`, t.forzaMia, nM);
  d.testo('LUI', px + 34 * u, y + 62 * u, 12, colLui, { titoli: true, bold: true, ls: 1, anchorX: 0.5, anchorY: 0.5 }).y = y + 62 * u;
  d.testo('TU', px + pw - 34 * u, y + 62 * u, 12, colTu, { titoli: true, bold: true, ls: 1, anchorX: 0.5, anchorY: 0.5 }).y = y + 62 * u;
  const cxp = px + pw / 2;
  for (let k = 1; k <= 5; k++) {
    const pieno = k <= t.inst;
    const col = pieno ? (k > 3 ? 0xe2553f : 0xe0a341) : 0xffffff;
    if (pieno) d.cerchio(cxp + (k - 3) * 16 * u, y + 22 * u, 9 * u, col, { alpha: 0.28 });
    d.cerchio(cxp + (k - 3) * 16 * u, y + 22 * u, 5.5 * u, col, { alpha: pieno ? 1 : 0.22 });
  }
  d.testo(`instabilità ${t.inst}`, cxp, y + 48 * u, 13, 0xe6dcc4, { anchorX: 0.5, anchorY: 0.5 }).y = y + 48 * u;
  y += 90 * u;
  // tappe
  const sigAvv = v.fazioneAvv === 'custodi' ? 'Sigillo' : 'Rito';
  const sigMio = v.fazione === 'custodi' ? 'Sigillo' : 'Rito';
  const tappa = (ha: boolean, togl: boolean, faz: string, testo: string, sicuro: string): void => {
    if (!ha) return;
    const col = faz === 'custodi' ? 0xb3301f : 0x2f8a4c;
    const luce = faz === 'custodi' ? 0xff7a62 : 0x9ff0b8;
    d.rett(px, y, pw, 32 * u, 0x070503, { alpha: 0.88, stroke: luce, sw: 1, r: 8 * u });
    d.punti[`disco:${i}:${faz === v.fazione ? 'mio' : 'loro'}`] = { x: px + 18 * u, y: y + 16 * u };
    if (togl) d.cerchio(px + 18 * u, y + 16 * u, 9 * u, 0x000000, { alpha: 0.4, stroke: luce, sw: 2 });
    else { d.cerchio(px + 18 * u, y + 16 * u, 11.5 * u, luce, { alpha: 0.25 }); d.cerchio(px + 18 * u, y + 16 * u, 9 * u, col, { stroke: luce, sw: 1 }); }
    d.adatta(togl ? `${testo}: ${sicuro}` : `${testo}: al sicuro`, px + 36 * u, y + 3 * u, pw - 42 * u, 26 * u, 13, 12, 0xf0e6cc, false, 'left');
    y += 36 * u;
  };
  tappa(t.loroTappa, t.loroTappaTogliibile, v.fazioneAvv, `${sigAvv} di Lui`, 'al sicuro dopo il tuo turno');
  tappa(t.mioTappa, t.mioTappaTogliibile, v.fazione, `${sigMio} tuo`, 'al sicuro dopo il turno di Lui');
  // cosa ti manca
  const manca = d.testo(cosaManca(t), cxp, y, 13, 0xf0e6cc, { w: pw, align: 'center', anchorX: 0.5, bordo: { colore: 0x000000, spessore: 3 } });
  manca.x = cxp;
  y += manca.height + 8 * u;
  // bottoni (in basso al centro)
  const nomeBtn = v.fazione === 'custodi' ? 'PONI SIGILLO' : 'COMPLETA RITO';
  const fondo = H - 38 * u;
  const centrata = (w: number): number => cxp - w / 2;
  if (sel.carta !== undefined) {
    const nc = v.mano.find((x) => x.uid === sel.carta)?.nome ?? '';
    const alto = 22 * u + (opz.pronta ? 38 * u : 0) + 32 * u + (opz.pres.length ? 22 * u : 0);
    let yb = Math.max(y + 2 * u, fondo - alto);
    const tc = d.riga(`Carta scelta: ${nc}`, px, yb, pw, 13.5, COL.selezione, { bold: true, bordo: { colore: 0x000000, spessore: 3 } });
    tc.x = cxp - tc.width / 2;
    yb += 24 * u;
    if (opz.pronta) {
      const w1 = d.larghezza('GIOCA LA CARTA', 12.5, { titoli: true, bold: true, ls: 0.5 }) + 26 * u;
      d.pillolaOro('btn:gioca', 'GIOCA LA CARTA', centrata(w1), yb, 32 * u, () => { c.giocaSelezionata(); az.rerender(); }, 12.5);
      yb += 38 * u;
    }
    const w2 = d.larghezza('ANNULLA', 12, { titoli: true, bold: true, ls: 0.5 }) + 26 * u;
    d.pillolaOro('btn:annulla', 'ANNULLA', centrata(w2), yb, 28 * u, () => { c.annulla(); az.rerender(); }, 12);
    if (opz.pres.length) d.testo('Tocca la carta bersaglio.', cxp, yb + 32 * u, 13, 0xf0e6cc, { anchorX: 0.5, corsivo: true, bordo: { colore: 0x000000, spessore: 3 } });
  } else {
    const qui = c.carteGiocabiliIn(i);
    const ok = qui.length > 0;
    const puo = c.puoTappa(i);
    const motivo = puo ? '' : motivoTappa(v, t);
    const alto = 40 * u + (ok ? 0 : 20 * u) + (puo ? 34 * u : motivo ? 38 * u : 0);
    let yb = Math.max(y + 2 * u, fondo - alto);
    const et = 'GIOCA UNA CARTA QUI';
    const w1 = d.larghezza(et, 12.5, { titoli: true, bold: true, ls: 0.5 }) + 34 * u;
    d.rett(centrata(w1), yb, w1, 36 * u, 0, {
      r: 18 * u, tex: ok ? gradViola() : gradGrigio(), stroke: ok ? 0xb48ae6 : 0x4a4332, sw: 1.4, id: 'scena:gioca-qui', tap: ok ? () => az.manoQui(true) : undefined,
    });
    d.testo(et, cxp, yb + 18 * u, 12.5, ok ? 0xeadcff : 0x8a8270, { titoli: true, bold: true, ls: 0.5, anchorX: 0.5, anchorY: 0.5 }).y = yb + 18 * u;
    yb += 40 * u;
    if (!ok) { d.testo(c.tuoTurno ? 'Nessuna carta si può giocare qui adesso.' : 'Turno di Lui: aspetta.', cxp, yb - 2 * u, 13, 0xe0d8c2, { anchorX: 0.5, corsivo: true, bordo: { colore: 0x000000, spessore: 3 } }); yb += 20 * u; }
    if (puo) {
      const e2 = `${nomeBtn} · ${t.costoTappa}`;
      const w2 = d.larghezza(e2, 12.5, { titoli: true, bold: true, ls: 0.5 }) + 28 * u;
      d.pillolaOro(`btn:tappa:${i}`, e2, centrata(w2), yb, 32 * u, () => { c.tappa(i); az.rerender(); }, 12.5);
    } else if (motivo) {
      d.testo(`${v.fazione === 'custodi' ? 'Poni Sigillo' : 'Completa rito'}: ${motivo}`, cxp, yb, 13, 0xe0d8c2, { anchorX: 0.5, w: pw, align: 'center', bordo: { colore: 0x000000, spessore: 3 } });
    }
  }

  // ---------- suggerimento in basso ----------
  const hint = 'Scorri per il luogo vicino · tieni premuto su una carta per leggerla · freccia o due dita che si allargano per tornare indietro';
  const wh = Math.min(W - 20 * u, d.larghezza(hint, 12) + 28 * u);
  d.rett((W - wh) / 2, H - 28 * u, wh, 22 * u, 0x070503, { alpha: 0.8, r: 11 * u });
  d.testo(hint, W / 2, H - 17 * u, 12, 0xe0d8c2, { anchorX: 0.5, anchorY: 0.5 }).y = H - 17 * u;

  // ---------- mano: solo le carte che si possono giocare qui ----------
  if (ui.manoQui && sel.carta === undefined) manoQui(d, c, ui, az, v, i, W, H);
}

function manoQui(d: Disegno, c: Controller, ui: UiStato, az: Azioni, v: ReturnType<Controller['vista']>, i: number, W: number, H: number): void {
  void ui;
  const u = d.u;
  d.rett(0, 0, W, H, 0x000000, { alpha: 0.6, r: 0, id: 'scena:chiudi-mano', tap: () => { if (!pressioneRecente()) az.manoQui(false); } });
  const uids = c.carteGiocabiliIn(i);
  const chh = Math.min(170 * u, H - 90 * u);
  const cw = chh * (90 / 126);
  const n = uids.length;
  const passo = n > 1 ? Math.min(cw + 12 * u, (W - 24 * u - cw) / (n - 1)) : 0;
  const tot = passo * Math.max(0, n - 1) + cw;
  const x0 = (W - tot) / 2;
  const y = H - chh - 24 * u;
  const titolo = 'Scegli la carta da giocare qui (tocca fuori per chiudere)';
  d.testo(titolo, W / 2, y - 28 * u, 14, COL.inciso, { titoli: true, bold: true, anchorX: 0.5, bordo: { colore: 0x000000, spessore: 3 } });
  uids.forEach((uid, k) => {
    const cd = v.mano.find((x) => x.uid === uid)!;
    const cont = new Container();
    cont.position.set(x0 + k * passo, y);
    d.s.addChild(cont);
    const dati = datiDaCarta(c, cd.id, cd.trasformata);
    cartaRidotta(cont, d, cw, chh, dati, { selezionata: false, giocabile: true });
    cont.eventMode = 'static';
    cont.cursor = 'pointer';
    cont.hitArea = new Rectangle(0, 0, cw, chh);
    cont.on('pointertap', () => { if (!pressioneRecente()) az.giocaQui(uid); });
    pressioneLunga(cont, () => az.grande({ tipo: 'carta', id: cd.id, trasformata: cd.trasformata }));
    d.aree[`mano:${uid}`] = { x: x0 + k * passo + cw * 0.15, y: y + 34 * u, w: Math.min(cw * 0.4, Math.max(8 * u, passo - cw * 0.2)), h: 40 * u };
  });
}

const gradBarra = () => texturaGradiente([[0, 'rgba(10,7,4,0.95)'], [1, 'rgba(10,7,4,0)']], true);
const gradViola = () => texturaGradiente([[0, 'rgba(70,44,100,0.95)'], [1, 'rgba(36,20,56,0.95)']], true);
const gradGrigio = () => texturaGradiente([[0, 'rgba(40,36,28,0.9)'], [1, 'rgba(26,22,16,0.9)']], true);
