// Tipi dei dati letti dai file YAML (docs/03-cards-content/01-card-database/).
export type FazioneId = 'custodi' | 'risvegliati';
export type TipoCarta = 'presenza' | 'azione';

export interface Citazione {
  testo: string;
  fonte: string;
  originale: string;
}

/** Valori che cambiano nella versione cosmica (quelli assenti restano come nella carta normale). */
export interface VersioneCosmica {
  citazione: Citazione;
  nome: string;
  costo: number;
  forza?: number;
  potente?: number;
  effetto: string;
}

export interface CartaDef {
  id: string;
  nome: string;
  tipo: TipoCarta;
  costo: number;
  forza?: number;
  potente: number;
  copie: number;
  effetto: string;
  citazione: Citazione;
  versione_cosmica?: VersioneCosmica;
}

export interface FazioneDef {
  id: FazioneId;
  nome: string;
  carte: CartaDef[];
}

export interface TerritorioDef {
  id: string;
  nome: string;
  effetto: string;
  citazione: Citazione;
  riserva: CartaDef[];
}

export type TipoEvento = 'territorio' | 'giocatore' | 'campo' | 'carte' | '?';
export type FaseEvento = 'fase_I' | 'fase_II' | 'fase_III';

export interface EventoDef {
  id: string;
  nome: string;
  tipo: TipoEvento;
  effetto: string;
  citazione: Citazione;
  /** Solo per gli eventi improvvisi: fase in cui finiscono ("II" o "III"). */
  fase?: string;
}

export interface Dati {
  fileCarte: string;
  fileEventi: string;
  fazioni: FazioneDef[];
  territori: TerritorioDef[];
  eventi: Record<FaseEvento, EventoDef[]> & { improvvisi: EventoDef[] };
  /** Quante righe di continuazione non valide in YAML rigoroso sono state riunite (vedi caricamento.ts). */
  acapoNormalizzati: { carte: number; eventi: number };
}
