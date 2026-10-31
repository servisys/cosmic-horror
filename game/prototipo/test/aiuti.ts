// Aiuti per i test: costruiscono situazioni di gioco precise partendo da una partita vera.
import { caricaDati } from '../src/dati/caricamento.js';
import { creaCatalogo } from '../src/motore/catalogo.js';
import { aggiornaControllo } from '../src/motore/operazioni.js';
import { applica, creaPartita, esegui, mosseLegali } from '../src/motore/motore.js';
import type { Partita } from '../src/motore/queries.js';
import type { Mossa, Presenza } from '../src/motore/stato.js';

export const cat = creaCatalogo(caricaDati());

/** Partita nuova: il giocatore 0 (primo) e' sempre Custodi, il giocatore 1 Risvegliati. Il giro 1, turno del primo. */
export function nuova(seme = 1, primo: 'custodi' | 'risvegliati' = 'custodi'): Partita {
  return creaPartita(cat, { seme, primaFazione: primo });
}

/** Mette in mano al giocatore esattamente queste carte (id; "id*" = versione cosmica). */
export function mano(g: Partita, pi: number, ...ids: string[]): void {
  g.s.giocatori[pi].mano = ids.map((id) => ({ uid: g.s.prossimoUid++, id: id.replace('*', ''), trasformata: id.endsWith('*') }));
}

export function energia(g: Partita, pi: number, n: number): void {
  g.s.giocatori[pi].energia = n;
}

/** Mette direttamente una presenza sul territorio. */
export function presenza(g: Partita, pi: number, t: number, id: string, opz: { cos?: boolean; bonus?: number; riordina?: boolean } = {}): Presenza {
  const p: Presenza = { uid: g.s.prossimoUid++, carta: { uid: g.s.prossimoUid++, id: id.replace('*', ''), trasformata: opz.cos ?? id.endsWith('*') }, bonus: opz.bonus ?? 0 };
  g.s.territori[t].presenze[pi].push(p);
  aggiornaControllo(g);
  if (g.s.decisione && !opz.riordina) applica(g, g.s.decisione.giocatore, { t: 'riordina', ordine: g.s.decisione.uids });
  return p;
}

export function inst(g: Partita, t: number, n: number): void {
  g.s.territori[t].inst = n;
}

export function esposizione(g: Partita, pi: number, n: number): void {
  g.s.giocatori[pi].esposizione = n;
}

/** Gioca la carta (la prima con quell'id in mano) con i parametri dati. */
export function gioca(g: Partita, pi: number, id: string, par: { terr?: number; pres?: number; cerca?: string } = {}): void {
  const c = g.s.giocatori[pi].mano.find((x) => x.id === id.replace('*', '') && x.trasformata === id.endsWith('*'));
  if (!c) throw new Error(`carta ${id} non in mano`);
  applica(g, pi, { t: 'gioca', carta: c.uid, ...par });
  if (g.s.decisione) applica(g, g.s.decisione.giocatore, { t: 'riordina', ordine: g.s.decisione.uids });
}

export function mossa(g: Partita, pi: number, m: Mossa): void {
  applica(g, pi, m);
}

export function finisci(g: Partita, pi: number): void {
  applica(g, pi, { t: 'fine' });
}

/** Il giocatore 0 e il 1 finiscono il turno: si arriva all'inizio del giro successivo. */
export function giroIntero(g: Partita): void {
  finisci(g, 0);
  finisci(g, 1);
}

export function ritorna(g: Partita): void {
  esegui(g);
}

export function legali(g: Partita): Mossa[] {
  return mosseLegali(g);
}

export const totPresenze = (g: Partita, t: number, pi: number): number => g.s.territori[t].presenze[pi].length;
export const ids = (v: { id: string }[]): string[] => v.map((x) => x.id);

/** Partita in cui il giocatore 0 (di turno) ha la fazione data; l'altro e' l'avversario (1). */
export function partita(fazione: 'custodi' | 'risvegliati', seme = 1): Partita {
  const g = nuova(seme, fazione);
  energia(g, 0, 20);
  return g;
}

/** Mette l'evento in cima al mazzetto del giro in corso: sara' il prossimo a risolversi. */
export function evento(g: Partita, id: string): void {
  const fase = g.s.giro <= 3 ? 'fase_I' : g.s.giro <= 6 ? 'fase_II' : 'fase_III';
  g.s.mazzettiEventi[fase].mazzo.push(id);
}

/** Alla fine del giro si risolve l'evento in cima: chiude i turni dei due giocatori. */
export function risolviEventoDi(g: Partita, id: string): void {
  evento(g, id);
  finisci(g, 0);
  finisci(g, 1);
}
