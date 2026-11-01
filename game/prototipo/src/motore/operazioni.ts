// Operazioni elementari che cambiano lo stato: esposizione, instabilita', pesca, trasformazioni, eliminazioni, controllo.
import { eff, forzaTerritorio, idTerr, log, numTappe, altro, type Partita } from './queries.js';
import { REGOLE, TERR } from './regole.js';
import { intero, mescola } from './rng.js';
import { NUM_TERR, type CartaIst, type Presenza } from './stato.js';

export function addInst(g: Partita, t: number, n: number): void {
  const terr = g.s.territori[t];
  let v = Math.max(0, Math.min(REGOLE.instMax, terr.inst + n));
  // Cerchio dei Vigilanti (CU05): finche' e' qui, l'instabilita' non puo' superare 3.
  const cerchio = terr.presenze.some((lista) => lista.some((p) => p.carta.id === 'CU05'));
  if (cerchio) v = Math.min(v, 3);
  terr.inst = v;
}

export function trasforma(g: Partita, pi: number, n: number): void {
  const gi = g.s.giocatori[pi];
  for (let i = 0; i < n; i++) {
    // "mazzo" = le carte ancora da pescare (CT-DES-058)
    const cand = gi.mazzo.filter((c) => !c.trasformata && g.cat.carte.get(c.id)?.versione_cosmica);
    if (!cand.length) return;
    const c = cand[intero(g.s, cand.length)];
    c.trasformata = true;
    log(g, `${gi.fazione}: una carta del mazzo si trasforma in ${eff(g, c).nome}`);
  }
}

export function addEsp(g: Partita, pi: number, n: number): void {
  const gi = g.s.giocatori[pi];
  const prima = gi.esposizione;
  gi.esposizione = Math.max(0, Math.min(REGOLE.esposizioneMax, prima + n));
  for (const soglia of REGOLE.sogliaTrasformazione) if (prima < soglia && soglia <= gi.esposizione) trasforma(g, pi, 1);
}

export function pesca(g: Partita, pi: number, n = 1): void {
  const gi = g.s.giocatori[pi];
  for (let i = 0; i < n; i++) {
    if (!gi.mazzo.length) {
      if (!gi.scarti.length) return;
      // CT-DES-042: si rimescolano gli scarti e l'esposizione sale di 1
      gi.mazzo = gi.scarti;
      gi.scarti = [];
      mescola(g.s, gi.mazzo);
      log(g, `${gi.fazione}: mazzo finito, rimescolati gli scarti`);
      addEsp(g, pi, 1);
    }
    gi.mano.push(gi.mazzo.pop()!);
  }
}

export function scartaCasuale(g: Partita, pi: number, n: number): void {
  const gi = g.s.giocatori[pi];
  for (let i = 0; i < n && gi.mano.length; i++) {
    const [c] = gi.mano.splice(intero(g.s, gi.mano.length), 1);
    gi.scarti.push(c);
    log(g, `${gi.fazione} scarta ${eff(g, c).nome}`);
  }
}

export function elimina(g: Partita, t: number, pi: number, p: Presenza, motivo: string): void {
  const lista = g.s.territori[t].presenze[pi];
  const i = lista.findIndex((x) => x.uid === p.uid);
  if (i < 0) return;
  lista.splice(i, 1);
  g.s.giocatori[pi].scarti.push(p.carta);
  log(g, `${eff(g, p.carta).nome} (${g.s.giocatori[pi].fazione}) eliminata: ${motivo}`);
}

/** Dopo ogni cambiamento: ricalcola il controllo dei territori e assegna i premi a chi ne prende uno (CT-DES-023, 026, 049). */
export function aggiornaControllo(g: Partita): void {
  for (let t = 0; t < NUM_TERR; t++) {
    const terr = g.s.territori[t];
    const a = forzaTerritorio(g, t, 0);
    const b = forzaTerritorio(g, t, 1);
    const nuovo: 0 | 1 | null = a > b ? 0 : b > a ? 1 : null; // parita': nessuno
    if (nuovo !== null && nuovo !== terr.controllo) {
      terr.controllo = nuovo;
      const gi = g.s.giocatori[nuovo];
      log(g, `${gi.fazione} prende il controllo di ${g.cat.dati.territori[t].nome}`);
      // carta della riserva del territorio in mano
      if (terr.riserva.length) {
        gi.mano.push(terr.riserva.pop()!);
        log(g, `${gi.fazione}: prende una carta di riserva`);
      }
      // La Biblioteca della Miskatonic (T2): pesca 1 carta, poi guarda le prime 3 del mazzo e le riordina (CT-DES-058)
      if (idTerr(g, t) === TERR.biblioteca) {
        pesca(g, nuovo, 1);
        if (gi.mazzo.length >= 2) {
          const top = gi.mazzo.slice(-3).reverse().map((c) => c.uid);
          g.s.decisione = { tipo: 'riordina', giocatore: nuovo, uids: top };
        }
      }
    } else {
      terr.controllo = nuovo;
    }
  }
}

/** Segnale di vittoria imminente (CT-DES-015, CT-DES-056). */
export function aggiornaSegnale(g: Partita, pi: number): void {
  const gi = g.s.giocatori[pi];
  const n = numTappe(g, pi);
  if (n === REGOLE.tappeVittoria - 1 && gi.segnale === null) {
    gi.segnale = g.s.giocatori[altro(pi)].turniGiocati;
    log(g, `SEGNALE: ${gi.fazione} e' a una tappa dalla vittoria`);
  } else if (n < REGOLE.tappeVittoria - 1) {
    gi.segnale = null;
  }
}

export function aggiungiTappa(g: Partita, pi: number, t: number): void {
  const gi = g.s.giocatori[pi];
  gi.tappe[t] = g.s.turniCompletati;
  log(g, `${gi.fazione} ottiene la tappa a ${g.cat.dati.territori[t].nome} (${numTappe(g, pi)}/${REGOLE.tappeVittoria})`);
  if (numTappe(g, pi) >= REGOLE.tappeVittoria) {
    g.s.vincitore = pi;
    log(g, `${gi.fazione} VINCE`);
  } else aggiornaSegnale(g, pi);
}

export function togliTappa(g: Partita, proprietario: number, t: number): void {
  delete g.s.giocatori[proprietario].tappe[t];
  log(g, `tappa di ${g.s.giocatori[proprietario].fazione} tolta a ${g.cat.dati.territori[t].nome}`);
  aggiornaSegnale(g, proprietario);
}
