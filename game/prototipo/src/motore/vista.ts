// Vista di un giocatore sulla partita: solo le informazioni che quel giocatore puo' vedere (Core Rules §9, CT-DES-039).
// Nascosti all'avversario: la mano e l'ordine del mazzo. Il computer riceve solo questa vista, mai lo stato completo.
import type { FazioneId } from '../dati/tipi.js';
import { carta } from './catalogo.js';
import { chiDeveMuovere, finita, mosseLegali } from './motore.js';
import {
  altro, costoTappa, forzaPresenza, forzaTerritorio, numTappe, tappaPosabile, tappaTogliibile, type Partita,
} from './queries.js';
import { prossimiTipiEventi } from './effetti.js';
import { REGOLE } from './regole.js';
import type { Mossa } from './stato.js';

export interface VistaCarta {
  uid: number;
  id: string;
  trasformata: boolean;
  nome: string;
  tipo: 'presenza' | 'azione';
  costo: number;
  forza: number;
  potente: number;
}

export interface VistaPresenza {
  uid: number;
  id: string;
  nome: string;
  trasformata: boolean;
  forza: number; // effettiva
}

export interface VistaTerritorio {
  indice: number;
  nome: string;
  inst: number;
  controllo: 'io' | 'avv' | null;
  mie: VistaPresenza[];
  loro: VistaPresenza[];
  forzaMia: number;
  forzaLoro: number;
  mioTappa: boolean;
  loroTappa: boolean;
  loroTappaTogliibile: boolean;
  /** La mia tappa si puo' ancora togliere (non e' al sicuro). */
  mioTappaTogliibile: boolean;
  /** Condizioni per la mia tappa soddisfatte (costo escluso) in questo momento. */
  tappaPossibile: boolean;
  costoTappa: number;
  riservaRimasta: number;
}

export interface Vista {
  io: number;
  fazione: FazioneId;
  fazioneAvv: FazioneId;
  giro: number;
  mioTurno: boolean;
  energia: number;
  esposizione: number;
  esposizioneAvv: number;
  mano: VistaCarta[];
  nManoAvv: number;
  nMazzo: number;
  nMazzoAvv: number;
  scarti: string[];
  scartiAvv: string[];
  tappe: number;
  tappeAvv: number;
  segnaleMio: boolean;
  segnaleAvv: boolean;
  territori: VistaTerritorio[];
  /** Tipo dell'evento che si risolve a fine giro (si vede sempre; gli improvvisi mostrano "?"). */
  prossimoEvento: string;
  eventiVisti: string[];
  mosseLegali: Mossa[];
}

export function creaVista(g: Partita, io: number): Vista {
  const s = g.s;
  const me = s.giocatori[io];
  const av = s.giocatori[altro(io)];
  const vc = (c: { uid: number; id: string; trasformata: boolean }): VistaCarta => {
    const e = carta(g.cat, c.id, c.trasformata);
    return { uid: c.uid, id: c.id, trasformata: c.trasformata, nome: e.nome, tipo: e.tipo, costo: e.costo, forza: e.forza, potente: e.potente };
  };
  return {
    io,
    fazione: me.fazione,
    fazioneAvv: av.fazione,
    giro: s.giro,
    mioTurno: s.turno === io,
    energia: me.energia,
    esposizione: me.esposizione,
    esposizioneAvv: av.esposizione,
    mano: me.mano.map(vc),
    nManoAvv: av.mano.length,
    nMazzo: me.mazzo.length,
    nMazzoAvv: av.mazzo.length,
    scarti: me.scarti.map((c) => c.id),
    scartiAvv: av.scarti.map((c) => c.id),
    tappe: numTappe(g, io),
    tappeAvv: numTappe(g, altro(io)),
    segnaleMio: me.segnale !== null,
    segnaleAvv: av.segnale !== null,
    territori: s.territori.map((t, i) => {
      const vp = (pi: number) => t.presenze[pi].map((p) => ({
        uid: p.uid, id: p.carta.id, nome: carta(g.cat, p.carta.id, p.carta.trasformata).nome, trasformata: p.carta.trasformata,
        forza: forzaPresenza(g, i, pi, p),
      }));
      return {
        indice: i,
        nome: g.cat.dati.territori[i].nome,
        inst: t.inst,
        controllo: t.controllo === null ? null : t.controllo === io ? 'io' : 'avv',
        mie: vp(io),
        loro: vp(altro(io)),
        forzaMia: forzaTerritorio(g, i, io),
        forzaLoro: forzaTerritorio(g, i, altro(io)),
        mioTappa: me.tappe[i] !== undefined,
        loroTappa: av.tappe[i] !== undefined,
        loroTappaTogliibile: tappaTogliibile(g, altro(io), i),
        mioTappaTogliibile: tappaTogliibile(g, io, i),
        tappaPossibile: tappaPosabile(g, io, i),
        costoTappa: costoTappa(g, io, i),
        riservaRimasta: t.riserva.length,
      } satisfies VistaTerritorio;
    }),
    prossimoEvento: prossimiTipiEventi(g, 1)[0] ?? '?',
    eventiVisti: me.eventiVisti.slice(),
    mosseLegali: !finita(g) && chiDeveMuovere(g) === io ? mosseLegali(g) : [],
  };
}

export const SOGLIA_SEGNALE = REGOLE.tappeVittoria - 1;
