// Cornici delle carte («collezionabili»): bordo sfumato nel colore della fazione, barra del nome con gemma del costo, illustrazione,
// barra del tipo, riquadro chiaro con effetto, citazione e fonte, riquadro della forza. Tre misure: scheda grande, media (scena del territorio),
// ridotta (mano). Nessuna regola: si disegnano solo i dati ricevuti.
import type { Container } from 'pixi.js';
import { carta } from '../motore/catalogo.js';
import type { Controller, EventoMostrato } from './controller.js';
import { COL, type Disegno, texturaGradiente } from './disegno.js';
import { anim } from './animazioni.js';
import { idImmagine } from './immagini.js';

export type Schema = 'custodi' | 'risvegliati' | 'evento' | 'riserva';

export interface DatiCarta {
  idImg: string;
  nome: string;
  costo: number | null;
  forza: number | null;
  tipo: string;
  effetto: string;
  citazione?: { testo: string; fonte: string; originale?: string };
  schema: Schema;
  cosmica: boolean;
}

interface Tavolozza {
  cornice: Array<[number, string]>;
  barra: Array<[number, string]>;
  alone: number;
  simbolo: number;
  luce: number;
}

const TAV: Record<Schema, Tavolozza> = {
  custodi: { cornice: [[0, '#e3eefb'], [0.3, '#6f9fd8'], [0.65, '#24466f'], [1, '#a9c7ea']], barra: [[0, '#f1ead2'], [1, '#cdbd92']], alone: 0x6ea0e6, simbolo: 0x24466f, luce: 0x9cc4f5 },
  risvegliati: { cornice: [[0, '#cdeed6'], [0.3, '#4f9a68'], [0.65, '#12301f'], [1, '#8fcfa4']], barra: [[0, '#e6ead2'], [1, '#b9c39a']], alone: 0x5ab478, simbolo: 0x12301f, luce: 0x8fdca4 },
  evento: { cornice: [[0, '#eadcf7'], [0.3, '#8a5cc0'], [0.65, '#2e1747'], [1, '#c3a2e6']], barra: [[0, '#efe6d6'], [1, '#c9b6a0']], alone: 0xa06edc, simbolo: 0x2e1747, luce: 0xc3a2e6 },
  riserva: { cornice: [[0, '#f3e3b6'], [0.3, '#c9a24c'], [0.65, '#5a4515'], [1, '#e0c27a']], barra: [[0, '#f1ead2'], [1, '#cdbd92']], alone: 0xe0b44c, simbolo: 0x5a4515, luce: 0xe6c46a },
};

export function tavolozza(s: Schema): Tavolozza {
  return TAV[s];
}

export function schemaDiId(id: string): Schema {
  if (id.startsWith('CU')) return 'custodi';
  if (id.startsWith('RI')) return 'risvegliati';
  if (id.startsWith('E')) return 'evento';
  return 'riserva';
}

const NOME_TIPO_EVENTO: Record<string, string> = { territorio: 'Territorio', giocatore: 'Giocatore', campo: 'Campo', carte: 'Carte', '?': 'Improvviso' };

export function datiDaCarta(c: Controller, id: string, trasformata: boolean): DatiCarta {
  const e = carta(c.cat, id, trasformata);
  const schema = schemaDiId(id);
  const faz = schema === 'custodi' ? 'Custodi' : schema === 'risvegliati' ? 'Risvegliati' : 'Riserva';
  return {
    idImg: idImmagine(id, trasformata), nome: e.nome, costo: e.costo, forza: e.tipo === 'presenza' ? e.forza : null,
    tipo: `${e.tipo === 'presenza' ? 'Presenza' : 'Azione'} — ${faz}`, effetto: e.effetto, citazione: e.citazione, schema, cosmica: trasformata,
  };
}

export function datiEvento(c: Controller, e: EventoMostrato): DatiCarta {
  return {
    idImg: e.id, nome: e.nome, costo: null, forza: null, tipo: `Evento — ${NOME_TIPO_EVENTO[e.tipo] ?? e.tipo}`, effetto: e.effetto,
    citazione: c.cat.eventi.get(e.id)!.citazione, schema: 'evento', cosmica: false,
  };
}

export function datiTerritorio(c: Controller, i: number): DatiCarta {
  const t = c.cat.dati.territori[i];
  return { idImg: t.id, nome: t.nome, costo: null, forza: null, tipo: 'Territorio', effetto: t.effetto, citazione: t.citazione, schema: 'riserva', cosmica: false };
}

/** Illustrazione della carta; se manca ancora (T4r, T5r) un segnaposto coerente con il nome della carta, da sostituire quando arriva l'immagine. */
function illustrazione(d: Disegno, dati: DatiCarta, x: number, y: number, w: number, h: number): void {
  if (d.immagine(dati.idImg, x, y, w, h, 1, 0)) return;
  const tv = TAV[dati.schema];
  d.rett(x, y, w, h, 0, { r: 0, tex: texturaGradiente([[0, '#2b2114'], [1, '#14100a']], true) });
  d.rett(x + 3 * d.u, y + 3 * d.u, w - 6 * d.u, h - 6 * d.u, 0, { r: 3 * d.u, alpha: 0.001, stroke: tv.luce, sw: 1, strokeAlpha: 0.55 });
  const t = d.testo(dati.nome, x + w / 2, y + h / 2, 12.5, 0xe6dcc4, { titoli: true, bold: true, anchorX: 0.5, anchorY: 0.5, w: w - 14 * d.u, align: 'center' });
  t.y = y + h / 2;
}

const RAPPORTO = 330 / 236;

/** Altezza della scheda grande per una data larghezza. */
export function altezzaCarta(w: number): number {
  return w * RAPPORTO;
}

function gemma(d: Disegno, cx: number, cy: number, r: number, testo: string, colore: 'blu' = 'blu'): void {
  void colore;
  d.cerchio(cx, cy + r * 0.12, r, 0x000000, { alpha: 0.45 });
  d.cerchio(cx, cy, r, 0x2a5ea8, { stroke: 0x13243b, sw: 1.2 });
  d.cerchio(cx - r * 0.18, cy - r * 0.2, r * 0.62, 0x82b8f5, { alpha: 0.9 });
  d.cerchio(cx - r * 0.3, cy - r * 0.32, r * 0.28, 0xf2f8ff, { alpha: 0.9 });
  const t = d.testo(testo, cx, cy, Math.max(10, r * 1.15) / d.u, 0x10233d, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 });
  t.y = cy;
}

export interface OpzCarta {
  /** Scheda con citazione ed eventuale originale in inglese. */
  completa?: boolean;
  /** Aureola luminosa attorno alla carta. */
  alone?: boolean;
  /** Mostra la carta con un contorno dorato (selezionata o bersaglio). */
  evidenzia?: boolean;
}

/**
 * Carta completa (scheda grande, o media nella scena del territorio) nel riquadro x,y larghezza w (altezza = w * 330/236).
 * `completa`: barra del tipo, effetto, citazione, fonte e originale; altrimenti nome, costo, illustrazione, effetto e forza.
 */
export function cartaGrande(d: Disegno, x: number, y: number, w: number, dati: DatiCarta, opz: OpzCarta = {}): void {
  const tv = TAV[dati.schema];
  const h = altezzaCarta(w);
  const u = d.u;
  const s = w / 236;
  const fz = (n: number, min = 12): number => Math.max(min, n * s) / u;
  const pad = 9 * s;
  const r = 14 * s;
  if (opz.alone || opz.evidenzia) d.alone(x, y, w, h, opz.evidenzia ? COL.selezione : tv.alone, opz.evidenzia ? 0.9 : 0.5, 22, r / u);
  d.rett(x - 2 * s, y - 2 * s, w + 4 * s, h + 4 * s, 0x0a0a0a, { r: r + 2 * s });
  d.rett(x, y, w, h, 0, { r, tex: texturaGradiente(tv.cornice) });
  const ix = x + pad;
  const iy = y + pad;
  const iw = w - 2 * pad;
  const ih = h - 2 * pad;
  d.rett(ix, iy, iw, ih, 0x0f0c08, { r: 8 * s, stroke: 0x000000, sw: 0.6 });
  // barra del nome
  const hb = Math.max(22 * u * 0.9, 30 * s);
  const barra = texturaGradiente(tv.barra, true);
  d.rett(ix, iy, iw, hb, 0, { r: 6 * s, tex: barra });
  const spazioGemma = dati.costo !== null ? hb * 0.9 : 0;
  const dn = d.clip(ix, iy, iw - spazioGemma, hb);
  if (opz.completa) dn.testo(dati.nome, ix + 8 * s, iy + hb / 2, fz(14, 12), 0x17110a, { titoli: true, bold: true, anchorY: 0.5 }).y = iy + hb / 2;
  else {
    // carta media: il nome in un carattere piu' stretto, su una riga, tagliato con «…» se non sta
    const tn = d.adatta(dati.nome, ix + 7 * s, iy + 1, iw - spazioGemma - 10 * s, hb - 2, fz(14, 12), 12, 0x17110a, true, 'left');
    tn.y = iy + (hb - tn.height) / 2;
  }
  if (dati.costo !== null) gemma(d, ix + iw - hb * 0.5, iy + hb / 2, hb * 0.38, String(dati.costo));
  // illustrazione
  const ay = iy + hb + 1.5 * s;
  const ah = opz.completa ? 128 * s : ih * 0.4;
  illustrazione(d, dati, ix, ay, iw, ah);
  d.rett(ix, ay + ah, iw, 2 * s, 0x3a2e18, { r: 0 });
  let yy = ay + ah + 2 * s;
  // barra del tipo
  if (opz.completa) {
    const ht = 24 * s;
    d.rett(ix, yy, iw, ht, 0, { r: 0, tex: barra });
    d.testo(dati.tipo, ix + 8 * s, yy + ht / 2, fz(11.5), 0x17110a, { titoli: true, bold: true, anchorY: 0.5 }).y = yy + ht / 2;
    yy += ht;
  }
  // riquadro chiaro con effetto (e citazione)
  const hres = iy + ih - yy;
  d.rett(ix, yy, iw, hres, 0xf1e8d0, { r: 0 });
  const fh = dati.forza !== null ? Math.max(28 * s, 26 * u) : 0;
  const dt = d.clip(ix, yy, iw, hres - (opz.completa ? 0 : fh));
  let ty = yy + 6 * s;
  const largT = iw - 16 * s;
  const eff = dt.adatta(dati.effetto || '(nessun effetto)', ix + 8 * s, ty, largT, opz.completa ? hres * 0.42 : hres - fh - 8 * s, fz(opz.completa ? 13.5 : 12.5, 12), 12, 0x17110a, false, 'left');
  ty += eff.height + 4 * s;
  if (opz.completa && dati.citazione) {
    dt.rett(ix + 8 * s, ty, largT, 1, 0xb9a77a, { r: 0 });
    ty += 5 * s;
    const ci = dt.testo('«' + dati.citazione.testo + '»', ix + 8 * s, ty, fz(12, 12), 0x4a3d26, { w: largT, corsivo: true });
    ty += ci.height + 2 * s;
    const fo = dt.testo('— ' + dati.citazione.fonte, ix + iw - 8 * s, ty, fz(10.5, 12), 0x6a5a3a, { anchorX: 1 });
    ty += fo.height + 2 * s;
    if (dati.citazione.originale && ty + 14 * s < yy + hres - fh) {
      // l'originale inglese puo' stare sotto i 10 px (richiesta)
      dt.testo(dati.citazione.originale, ix + 8 * s, ty, Math.max(9, 9.5 * s) / u, 0x7a6a4a, { w: largT, corsivo: true, piccolo: true });
    }
  }
  // riquadro della forza (presenze)
  if (dati.forza !== null) {
    const fw = Math.max(34 * s, opz.completa ? 24 * u : 34 * u);
    const fhh = Math.max(24 * s, opz.completa ? 20 * u : 28 * u);
    const fx = ix + iw - fw - 4 * s;
    const fy = iy + ih - fhh - 3 * s;
    d.rett(fx, fy, fw, fhh, 0, { r: 6 * s, tex: barra, stroke: 0x3a2e18, sw: 1.2 });
    d.testo(String(dati.forza), fx + fw / 2, fy + fhh / 2, fz(opz.completa ? 17 : 20, opz.completa ? 17 : 20), 0x17110a, { titoli: true, bold: true, peso: '900', anchorX: 0.5, anchorY: 0.5 }).y = fy + fhh / 2;
  }
  if (dati.cosmica) d.testo('✦', ix + iw - 6 * s, ay + 4 * s, fz(14, 14), 0xd08cff, { anchorX: 1, bold: true });
}

export interface OpzMano {
  selezionata: boolean;
  giocabile: boolean;
}

/**
 * Carta ridotta della mano: nome, costo e illustrazione (w x h), disegnata nel contenitore con origine in alto a sinistra.
 * Giocabile: bordo dorato luminoso con un leggero bagliore che pulsa piano e piena luminosita'. Non giocabile: sbiadita, senza bagliore.
 * Selezionata: bordo e bagliore piu' forti (e la carta e' piu' alta, lo decide la mano).
 */
export function cartaRidotta(cont: Container, dd: Disegno, w: number, h: number, dati: DatiCarta, opz: OpzMano): void {
  const d = dd.dentro(cont);
  const u = d.u;
  const tv = TAV[dati.schema];
  const r = 7 * u;
  const spenta = !opz.giocabile && !opz.selezionata;
  if (opz.selezionata) d.alone(0, 0, w, h, COL.selezione, 1, 22, 7);
  else if (opz.giocabile) anim.luce(d.alone(0, 0, w, h, COL.oroChiaro, 0.75, 14, 7), 'pulsa', { min: 0.45, max: 1, periodo: 1700, fase: 0 });
  d.rett(-1, -1, w + 2, h + 2, 0x0a0a0a, { r: r + 1 });
  d.rett(0, 0, w, h, 0, {
    r, tex: texturaGradiente(tv.cornice), stroke: opz.selezionata ? COL.selezione : opz.giocabile ? 0xffd25a : undefined, sw: opz.selezionata ? 3.2 : 2.6,
  });
  const p = 3 * u;
  d.rett(p, p, w - 2 * p, h - 2 * p, 0x120f0b, { r: 5 * u });
  const hb = 22 * u;
  d.rett(p, p, w - 2 * p, hb, 0, { r: 4 * u, tex: texturaGradiente(tv.barra, true) });
  const costoW = dati.costo !== null ? 19 * u : 0;
  d.riga(dati.nome, p + 4 * u, p + hb / 2 - 7 * u, w - 2 * p - costoW - 6 * u, 12.5, 0x17110a, { bold: true });
  if (dati.costo !== null) gemma(d, w - p - 10 * u, p + hb / 2, 8.5 * u, String(dati.costo));
  const ay = p + hb + 1 * u;
  const ah = 62 * u;
  illustrazione(d, dati, p, ay, w - 2 * p, ah);
  d.rett(p, ay + ah, w - 2 * p, 1.5 * u, 0x3a2e18, { r: 0 });
  const yb = ay + ah + 1.5 * u;
  d.rett(p, yb, w - 2 * p, h - p - yb, 0xefe6cf, { r: 3 * u });
  const piede = dati.tipo.split(' ')[0];
  d.testo(piede, p + 5 * u, yb + 4 * u, 12, 0x4a3d26, { titoli: true });
  if (dati.forza !== null) d.testo(String(dati.forza), w - p - 5 * u, h - p - 5 * u, 20, 0x17110a, { titoli: true, bold: true, peso: '900', anchorX: 1, anchorY: 1 });
  if (dati.cosmica) d.testo('✦', p + 4 * u, ay + 3 * u, 14, 0xd08cff, { bold: true });
  // non giocabile: sbiadita
  if (spenta) d.rett(0, 0, w, h, 0x0a0a12, { r, alpha: 0.5 });
  void tv;
}
