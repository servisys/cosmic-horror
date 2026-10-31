// Stato della partita. Tutto e' dati semplici (serializzabili in JSON): nessuna funzione, nessun riferimento circolare.
import type { FazioneId } from '../dati/tipi.js';

export interface CartaIst {
  uid: number;
  /** id nel catalogo (CU01, RI08, T1r...). */
  id: string;
  trasformata: boolean;
}

export interface Presenza {
  uid: number;
  carta: CartaIst;
  /** Modifiche permanenti alla forza (bonus positivi, malus negativi). */
  bonus: number;
}

export interface Giocatore {
  fazione: FazioneId;
  mazzo: CartaIst[]; // la cima e' l'ultimo elemento
  mano: CartaIst[];
  scarti: CartaIst[];
  esposizione: number;
  energia: number;
  turniGiocati: number;
  /** territorio -> turniCompletati (globale) al momento in cui la tappa e' stata ottenuta. */
  tappe: Record<number, number>;
  /** turniGiocati dell'avversario quando e' scattato il segnale (null = nessun segnale). */
  segnale: number | null;
  esposizioneRidottaInTurno: boolean;
  /** Sconto sulla prossima tappa del turno (carte "Preparare"). */
  scontoTappa: number;
  /** Tipi dei prossimi eventi rivelati dal Diario di Zadok Allen (informazione visibile al solo proprietario). */
  eventiVisti: string[];
}

export interface TerritorioStato {
  inst: number;
  presenze: [Presenza[], Presenza[]];
  controllo: 0 | 1 | null;
  riserva: CartaIst[];
  /** Malus temporaneo di forza a tutte le presenze (Nebbia dal Mare). */
  malus: number;
  /** Il malus finisce alla fine di questo giro (incluso). */
  malusFinoAlGiro: number;
}

export type Passo =
  | 'inizio_energia'
  | 'inizio_pesca'
  | 'inizio_effetti'
  | 'azioni'
  | 'fine_turno'
  | 'evento'
  | 'crescita'
  | 'soglia5'
  | 'scadenze'
  | 'nuovo_giro';

export interface Decisione {
  tipo: 'riordina';
  giocatore: number;
  /** Carte in cima al mazzo (dalla cima in giu'). */
  uids: number[];
}

export interface Mazzetto {
  mazzo: string[]; // id degli eventi, cima = ultimo
  scarti: string[];
}

export type Mossa =
  | { t: 'gioca'; carta: number; terr?: number; pres?: number; cerca?: string }
  | { t: 'tappa'; terr: number }
  | { t: 'riduci' }
  | { t: 'riordina'; ordine: number[] }
  | { t: 'fine' };

export interface Stato {
  seme: number;
  rng: number;
  prossimoUid: number;
  giro: number;
  /** Indice (0 = primo, 1 = secondo) del giocatore di turno. */
  turno: number;
  giocatori: [Giocatore, Giocatore];
  territori: [TerritorioStato, TerritorioStato, TerritorioStato];
  mazzettiEventi: Record<'fase_I' | 'fase_II' | 'fase_III', Mazzetto>;
  passi: Passo[];
  decisione: Decisione | null;
  /** Turni completati in tutta la partita (serve alle tappe consolidate e al turno di avviso). */
  turniCompletati: number;
  vincitore: number | null;
  /** Id dell'ultimo evento cosmico risolto (serve a mostrarlo; non influisce sul gioco). */
  ultimoEvento: string | null;
  /** Fine per limite di giri: nessun vincitore. */
  finitaPerLimite: boolean;
  maxGiri: number;
  /** Registro di tutte le mosse (CT-DES-019). */
  registro: { g: number; m: Mossa }[];
  /** Cronaca testuale (solo per spiegare le mosse; non influisce sul gioco). */
  cronaca: string[];
}

export const NUM_TERR = 3;
