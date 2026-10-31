// Funzioni di sola lettura sullo stato (forza, controllo, tappe) e piccole operazioni di base.
import { carta, type Catalogo, type CartaEff } from './catalogo.js';
import { REGOLE } from './regole.js';
import type { CartaIst, Presenza, Stato } from './stato.js';
import { NUM_TERR } from './stato.js';

export interface Partita {
  s: Stato;
  cat: Catalogo;
}

export const eff = (g: Partita, c: CartaIst): CartaEff => carta(g.cat, c.id, c.trasformata);

export function log(g: Partita, msg: string): void {
  g.s.cronaca.push(msg);
}

export const altro = (pi: number): number => 1 - pi;

/** Forza effettiva di una presenza (mai sotto 0). */
export function forzaPresenza(g: Partita, t: number, pi: number, p: Presenza): number {
  const terr = g.s.territori[t];
  const c = eff(g, p.carta);
  let f = c.forza + p.bonus;
  // Henry Armitage (CU04): le altre presenze dello stesso giocatore sullo stesso territorio hanno +1 (una per ogni Armitage).
  const armitage = terr.presenze[pi].filter((x) => x.carta.id === 'CU04' && x.uid !== p.uid).length;
  f += armitage;
  // Cultista delle Paludi (RI02): +1 (cosmica +2) se instabilita' 3 o piu'.
  if (p.carta.id === 'RI02' && terr.inst >= 3) f += p.carta.trasformata ? 2 : 1;
  if (terr.inst >= REGOLE.sogliaForzaMeno1) f -= 1;
  f -= terr.malus;
  return Math.max(0, f);
}

/** Forza usata per il controllo: la Effigie di Cthulhu (RI09) conta per i riti ma non per il controllo. */
export function forzaTerritorio(g: Partita, t: number, pi: number): number {
  return g.s.territori[t].presenze[pi].filter((p) => p.carta.id !== 'RI09').reduce((a, p) => a + forzaPresenza(g, t, pi, p), 0);
}

export function numControllati(g: Partita, pi: number): number {
  return g.s.territori.filter((t) => t.controllo === pi).length;
}

export function numTappe(g: Partita, pi: number): number {
  return Object.keys(g.s.giocatori[pi].tappe).length;
}

/** Una tappa si puo' togliere finche' non e' consolidata: fino alla fine del turno successivo dell'avversario (CT-DES-056). */
export function tappaTogliibile(g: Partita, proprietario: number, t: number): boolean {
  const posa = g.s.giocatori[proprietario].tappe[t];
  return posa !== undefined && g.s.turniCompletati - posa <= 1;
}

export function esposizionePiuAlta(g: Partita): number[] {
  const m = Math.max(g.s.giocatori[0].esposizione, g.s.giocatori[1].esposizione);
  return [0, 1].filter((i) => g.s.giocatori[i].esposizione === m);
}

export function costoTappa(g: Partita, pi: number, t: number): number {
  const gi = g.s.giocatori[pi];
  let c = REGOLE.costoTappa - gi.scontoTappa;
  if (gi.fazione === 'risvegliati') {
    // Lavinia Whateley (RI06): i riti su questo territorio costano 1 in meno (una volta per ogni Lavinia).
    c -= g.s.territori[t].presenze[pi].filter((p) => p.carta.id === 'RI06').length;
  }
  return Math.max(0, c);
}

/**
 * Condizioni per porre un Sigillo (Custodi) o completare un rito (Risvegliati) sul territorio t, escluso il costo (CT-DES-055, CT-DES-015).
 */
export function tappaPosabile(g: Partita, pi: number, t: number): boolean {
  const gi = g.s.giocatori[pi];
  const terr = g.s.territori[t];
  if (gi.tappe[t] !== undefined) return false; // al massimo una per territorio
  if (numTappe(g, pi) >= REGOLE.tappeVittoria - 1) {
    // L'ultima tappa e' possibile solo dopo il turno di avviso dell'avversario.
    const avv = g.s.giocatori[altro(pi)];
    if (gi.segnale === null || avv.turniGiocati <= gi.segnale) return false;
  }
  if (gi.fazione === 'custodi') return terr.controllo === pi && terr.inst <= REGOLE.sogliaSigillo;
  const mie = terr.presenze[pi];
  return mie.length > 0 && forzaTerritorio(g, t, pi) >= forzaTerritorio(g, t, altro(pi)) && terr.inst >= REGOLE.sogliaSigillo;
}


export function tuttePresenze(g: Partita): { t: number; pi: number; p: Presenza }[] {
  const out: { t: number; pi: number; p: Presenza }[] = [];
  for (let t = 0; t < NUM_TERR; t++) for (let pi = 0; pi < 2; pi++) for (const p of g.s.territori[t].presenze[pi]) out.push({ t, pi, p });
  return out;
}
