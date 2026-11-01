// Motore delle regole: crea una partita, elenca le mosse legali, applica una mossa. Nessuna grafica (CT-DES-020).
import type { FazioneId } from '../dati/tipi.js';
import type { Catalogo } from './catalogo.js';
import { effettoAzione, effettoIngresso, parametriPossibili, territorioPerPotente, type Param } from './effetti.js';
import {
  assicuraMazzetto, creaMazzettiEventi, effettiCosmiciTerritori, instabilitaCrescente, risolviEvento, scadenze,
} from './eventi.js';
import { addEsp, addInst, aggiornaControllo, aggiungiTappa, pesca } from './operazioni.js';
import {
  costoTappa, eff, idTerr, indiceTerr, log, numControllati, pietreRitte, tappaPosabile, type Partita,
} from './queries.js';
import { faseDelGiro, REGOLE, TERR } from './regole.js';
import { casuale, mescola } from './rng.js';
import {
  NUM_TERR, type CartaIst, type Giocatore, type Mossa, type Passo, type Presenza, type Stato, type TerritorioStato,
} from './stato.js';

export interface OpzioniPartita {
  seme: number;
  /** Se presente, impone chi gioca per primo; altrimenti si sorteggia (Core Rules §1). */
  primaFazione?: FazioneId;
  maxGiri?: number;
}

function nuovaCarta(s: Stato, id: string): CartaIst {
  return { uid: s.prossimoUid++, id, trasformata: false };
}

export function creaPartita(cat: Catalogo, opz: OpzioniPartita): Partita {
  const s = { seme: opz.seme, rng: opz.seme >>> 0, prossimoUid: 1 } as Stato;
  const g: Partita = { s, cat };
  s.giro = 1;
  s.turno = 0;
  s.passi = ['inizio_energia', 'inizio_pesca', 'inizio_effetti', 'azioni'];
  s.decisione = null;
  s.turniCompletati = 0;
  s.vincitore = null;
  s.finitaPerLimite = false;
  s.ultimoEvento = null;
  s.maxGiri = opz.maxGiri ?? REGOLE.maxGiriPredefinito;
  s.registro = [];
  s.cronaca = [];
  s.mazzettiEventi = creaMazzettiEventi(g);
  // mazzi: sempre nello stesso ordine (custodi poi risvegliati), cosi' il seme da' sempre gli stessi mazzi
  const mazzi: Record<string, CartaIst[]> = {};
  for (const f of cat.dati.fazioni) {
    const m: CartaIst[] = [];
    for (const c of f.carte) for (let i = 0; i < c.copie; i++) m.push(nuovaCarta(s, c.id));
    mazzi[f.id] = mescola(s, m);
  }
  const primo: FazioneId = opz.primaFazione ?? (casuale(s) < 0.5 ? 'custodi' : 'risvegliati');
  const ordine: FazioneId[] = primo === 'custodi' ? ['custodi', 'risvegliati'] : ['risvegliati', 'custodi'];
  s.giocatori = ordine.map((f): Giocatore => ({
    fazione: f, mazzo: mazzi[f], mano: [], scarti: [], esposizione: 0, energia: 0, turniGiocati: 0, tappe: {},
    segnale: null, esposizioneRidottaInTurno: false, pietreUsateInTurno: false, aperturaTappa: false, eventiVisti: [],
  })) as [Giocatore, Giocatore];
  s.territori = cat.dati.territori.map((t): TerritorioStato => ({
    inst: 0, presenze: [[], []], controllo: null, malus: 0, malusFinoAlGiro: 0,
    riserva: t.riserva.flatMap((r) => Array.from({ length: r.copie }, () => nuovaCarta(s, r.id))),
  }));
  // mano iniziale: 5 carte, il secondo giocatore ne pesca 1 in piu'
  for (let p = 0; p < 2; p++) pesca(g, p, REGOLE.manoIniziale + p);
  log(g, `Partita con seme ${opz.seme}: apre ${s.giocatori[0].fazione}`);
  esegui(g);
  return g;
}

export const chiDeveMuovere = (g: Partita): number => (g.s.decisione ? g.s.decisione.giocatore : g.s.turno);

export const finita = (g: Partita): boolean => g.s.vincitore !== null || g.s.finitaPerLimite;

function permutazioni(v: number[]): number[][] {
  if (v.length <= 1) return [v.slice()];
  const out: number[][] = [];
  v.forEach((x, i) => {
    for (const r of permutazioni([...v.slice(0, i), ...v.slice(i + 1)])) out.push([x, ...r]);
  });
  return out;
}

export function chiaveMossa(m: Mossa): string {
  return JSON.stringify(m);
}

export function mosseLegali(g: Partita): Mossa[] {
  if (finita(g)) return [];
  const s = g.s;
  if (s.decisione) return permutazioni(s.decisione.uids).map((ordine) => ({ t: 'riordina', ordine }));
  if (s.passi[0] !== 'azioni') return [];
  const pi = s.turno;
  const gi = s.giocatori[pi];
  const out: Mossa[] = [];
  const viste = new Set<string>();
  for (const c of gi.mano) {
    const ce = eff(g, c);
    if (ce.costo > gi.energia) continue;
    for (const p of parametriPossibili(g, pi, c)) {
      const m: Mossa = { t: 'gioca', carta: c.uid, ...p };
      // le copie identiche della stessa carta producono la stessa mossa: se ne tiene una sola per tipo (id + trasformata)
      const k = `${c.id}|${c.trasformata}|${JSON.stringify(p)}`;
      if (viste.has(k)) continue;
      viste.add(k);
      out.push(m);
    }
  }
  for (let t = 0; t < NUM_TERR; t++) {
    if (tappaPosabile(g, pi, t) && costoTappa(g, pi, t) <= gi.energia) out.push({ t: 'tappa', terr: t });
  }
  for (const p of pietreRitte(g, pi)) out.push({ t: 'pietre', ...p });
  if (gi.energia >= REGOLE.costoRiduzione && !gi.esposizioneRidottaInTurno && gi.esposizione > 0) out.push({ t: 'riduci' });
  out.push({ t: 'fine' });
  return out;
}

export class MossaIllegale extends Error {}

export function applica(g: Partita, giocatore: number, m: Mossa): void {
  if (finita(g)) throw new MossaIllegale('partita finita');
  if (giocatore !== chiDeveMuovere(g)) throw new MossaIllegale(`tocca al giocatore ${chiDeveMuovere(g)}`);
  const k = chiaveMossa(m);
  // le copie identiche in mano: accetta anche la mossa con un'altra copia dello stesso tipo
  const legale = mosseLegali(g).some((x) => chiaveMossa(x) === k) || (m.t === 'gioca' && equivalenteLegale(g, m));
  if (!legale) throw new MossaIllegale('mossa non legale: ' + k);
  g.s.registro.push({ g: giocatore, m });
  eseguiMossa(g, giocatore, m);
  if (!finita(g)) aggiornaControllo(g);
  esegui(g);
}

function equivalenteLegale(g: Partita, m: Extract<Mossa, { t: 'gioca' }>): boolean {
  const pi = g.s.turno;
  if (g.s.decisione) return false;
  const c = g.s.giocatori[pi].mano.find((x) => x.uid === m.carta);
  if (!c || eff(g, c).costo > g.s.giocatori[pi].energia) return false;
  const { carta: _c, t: _t, ...p } = m;
  return parametriPossibili(g, pi, c).some((q) => JSON.stringify(q) === JSON.stringify(p));
}

function eseguiMossa(g: Partita, pi: number, m: Mossa): void {
  const s = g.s;
  const gi = s.giocatori[pi];
  switch (m.t) {
    case 'riordina': {
      const gp = s.giocatori[s.decisione!.giocatore];
      const n = m.ordine.length;
      const cartePerUid = new Map(gp.mazzo.slice(-n).map((c) => [c.uid, c]));
      const nuovo = [...m.ordine].reverse().map((u) => cartePerUid.get(u)!);
      gp.mazzo.splice(gp.mazzo.length - n, n, ...nuovo);
      s.decisione = null;
      log(g, `${gp.fazione} riordina le prime ${n} carte del mazzo`);
      return;
    }
    case 'fine':
      s.passi.shift(); // toglie 'azioni'
      s.passi.unshift('fine_turno');
      log(g, `${gi.fazione} finisce il turno`);
      return;
    case 'riduci':
      gi.energia -= REGOLE.costoRiduzione;
      gi.esposizioneRidottaInTurno = true;
      addEsp(g, pi, -1);
      log(g, `${gi.fazione} riduce l'esposizione`);
      return;
    case 'tappa': {
      gi.energia -= costoTappa(g, pi, m.terr);
      aggiungiTappa(g, pi, m.terr);
      return;
    }
    case 'pietre':
      gi.energia -= REGOLE.costoPietreRitte;
      gi.pietreUsateInTurno = true;
      log(g, `${gi.fazione} usa le Pietre ritte di Dunwich: instabilita' di ${g.cat.dati.territori[m.terr].nome} ${m.segno > 0 ? '+1' : '-1'}`);
      addInst(g, m.terr, m.segno);
      return;
    case 'gioca': {
      const i = gi.mano.findIndex((x) => x.uid === m.carta);
      const c = gi.mano[i];
      const ce = eff(g, c);
      gi.energia -= ce.costo;
      gi.mano.splice(i, 1);
      const par: Param = { terr: m.terr, pres: m.pres, cerca: m.cerca, segno: m.segno };
      log(g, `${gi.fazione} gioca ${ce.nome}`);
      // carta potente: esposizione e, se coinvolge un territorio, instabilita' (+1 in piu' alla Landa Maledetta;
      // a R'lyeh, La citta' dormiente, +1 in piu' di esposizione per chi la gioca)
      if (ce.potente) {
        const t = territorioPerPotente(g, m);
        addEsp(g, pi, ce.potente + (t !== undefined && idTerr(g, t) === TERR.rlyeh ? REGOLE.espExtraRlyeh : 0));
        if (t !== undefined) addInst(g, t, 1 + (idTerr(g, t) === TERR.landa ? 1 : 0));
      }
      if (ce.tipo === 'presenza') {
        const pres: Presenza = { uid: s.prossimoUid++, carta: c, bonus: 0 };
        s.territori[m.terr!].presenze[pi].push(pres);
        // il Cerchio dei Vigilanti entrando abbassa a 3 un'instabilita' superiore
        addInst(g, m.terr!, 0);
        effettoIngresso(g, pi, pres, m.terr!, par);
      } else {
        gi.scarti.push(c);
        effettoAzione(g, pi, c, par);
      }
      return;
    }
  }
}

// ---------- flusso di partita ----------
export function esegui(g: Partita): void {
  const s = g.s;
  while (!finita(g) && !s.decisione && s.passi.length && s.passi[0] !== 'azioni') {
    const p = s.passi.shift() as Passo;
    passo(g, p);
    if (!finita(g)) aggiornaControllo(g);
  }
}

function passo(g: Partita, p: Passo): void {
  const s = g.s;
  const pi = s.turno;
  const gi = s.giocatori[pi];
  switch (p) {
    case 'inizio_energia': {
      gi.turniGiocati++;
      let base = Math.min(REGOLE.energiaPrimoTurno + gi.turniGiocati - 1, REGOLE.energiaMax);
      if (s.giro === 1) base = REGOLE.energiaPrimoTurnoPartita[pi]; // CT-DES-057: eccezione del primo turno della partita
      const extra = numControllati(g, pi) >= REGOLE.extraTerritori.minimo ? REGOLE.extraTerritori.energia : 0;
      gi.energia = base + extra;
      gi.esposizioneRidottaInTurno = false;
      gi.pietreUsateInTurno = false;
      gi.aperturaTappa = false;
      log(g, `--- Giro ${s.giro}, turno di ${gi.fazione}: energia ${gi.energia}`);
      return;
    }
    case 'inizio_pesca':
      pesca(g, pi, 1 + (s.territori[indiceTerr(g, TERR.innsmouth)].controllo === pi ? 1 : 0));
      return;
    case 'inizio_effetti':
      for (let t = 0; t < NUM_TERR; t++) {
        for (const pr of s.territori[t].presenze[pi]) {
          if (pr.carta.id === 'CU07') addInst(g, t, -1);
          else if (pr.carta.id === 'RI05') addInst(g, t, 1);
        }
      }
      return;
    case 'fine_turno':
      gi.aperturaTappa = false;
      s.turniCompletati++;
      if (pi === 0) {
        s.turno = 1;
        s.passi = ['inizio_energia', 'inizio_pesca', 'inizio_effetti', 'azioni'];
      } else {
        s.passi = ['evento', 'crescita', 'soglia5', 'scadenze', 'nuovo_giro'];
      }
      return;
    case 'evento':
      risolviEvento(g);
      return;
    case 'crescita':
      instabilitaCrescente(g);
      return;
    case 'soglia5':
      effettiCosmiciTerritori(g);
      return;
    case 'scadenze':
      scadenze(g);
      return;
    case 'nuovo_giro':
      s.giro++;
      s.turno = 0;
      // il mazzetto della fase del prossimo evento non deve essere vuoto
      assicuraMazzetto(g, faseDelGiro(s.giro));
      if (s.giro > s.maxGiri) {
        s.finitaPerLimite = true;
        log(g, `Partita interrotta: oltre ${s.maxGiri} giri`);
      } else s.passi = ['inizio_energia', 'inizio_pesca', 'inizio_effetti', 'azioni'];
      return;
    case 'azioni':
      return;
  }
}

/** Rigioca una partita dal seme e dal registro delle mosse: stessa partita (CT-DES-019). */
export function riproduci(cat: Catalogo, opz: OpzioniPartita, registro: { g: number; m: Mossa }[]): Partita {
  const g = creaPartita(cat, opz);
  for (const r of registro) applica(g, r.g, r.m);
  return g;
}

