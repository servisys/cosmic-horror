// Controller dell'interfaccia: tiene la partita e la selezione del giocatore umano, e muove il computer una mossa alla volta.
// NON contiene regole: ogni cosa legale viene chiesta al motore (mosseLegali / applica) e ogni informazione viene dalla vista.
import { sceglieMossa } from '../computer/computer.js';
import type { Dati, FazioneId } from '../dati/tipi.js';
import { carta, creaCatalogo, type Catalogo } from '../motore/catalogo.js';
import { applica, chiaveMossa, chiDeveMuovere, creaPartita, finita } from '../motore/motore.js';
import type { Partita } from '../motore/queries.js';
import type { Mossa } from '../motore/stato.js';
import { creaVista, type Vista } from '../motore/vista.js';

type Gioca = Extract<Mossa, { t: 'gioca' }>;

export interface Selezione {
  carta?: number;
  terr?: number;
  pres?: number;
}

export interface Opzioni {
  terr: number[];
  pres: number[];
  cerca: string[];
  /** La carta selezionata si puo' giocare cosi' com'e' (premendo "Gioca"). */
  pronta: boolean;
}

export interface EventoMostrato {
  id: string;
  nome: string;
  tipo: string;
  effetto: string;
  citazione: { testo: string; fonte: string };
}

const NOME_FAZIONE: Record<string, string> = { custodi: 'I Custodi', risvegliati: 'I Risvegliati' };

export class Controller {
  readonly cat: Catalogo;
  g!: Partita;
  umano = 0;
  fazioneUmano: FazioneId = 'custodi';
  seme = 0;
  selezione: Selezione = {};
  /** Frasi che spiegano le ultime mosse (soprattutto quelle del computer). */
  messaggio = '';
  evento: EventoMostrato | null = null;
  private ultimoEventoVisto: string | null = null;
  private righeViste = 0;

  constructor(dati: Dati) {
    this.cat = creaCatalogo(dati);
  }

  nuova(fazione: FazioneId, seme: number): void {
    this.seme = seme;
    this.fazioneUmano = fazione;
    // chi gioca per primo si sorteggia con il seme (Core Rules §1)
    this.g = creaPartita(this.cat, { seme });
    this.umano = this.g.s.giocatori.findIndex((p) => p.fazione === fazione);
    this.selezione = {};
    this.evento = null;
    this.ultimoEventoVisto = null;
    this.righeViste = this.g.s.cronaca.length;
    this.messaggio = `Apre ${NOME_FAZIONE[this.g.s.giocatori[0].fazione]}.`;
  }

  /** C'e' una partita in corso (prima di scegliere la fazione non c'e' ancora uno stato). */
  get attiva(): boolean {
    return this.g !== undefined;
  }

  get finita(): boolean {
    return finita(this.g);
  }

  vista(): Vista {
    return creaVista(this.g, this.umano);
  }

  /** Tocca al giocatore umano (una mossa, o il riordino della Biblioteca)? */
  get tuoTurno(): boolean {
    return !this.finita && chiDeveMuovere(this.g) === this.umano;
  }

  /** Il computer deve muovere. */
  get tocca_al_computer(): boolean {
    return !this.finita && chiDeveMuovere(this.g) !== this.umano;
  }

  get decisione(): { uids: number[] } | null {
    const d = this.g.s.decisione;
    return d && d.giocatore === this.umano ? { uids: d.uids } : null;
  }

  nomeCarta(uid: number): string {
    const c = this.g.s.giocatori[this.umano].mazzo.find((x) => x.uid === uid) ?? this.g.s.giocatori[this.umano].mano.find((x) => x.uid === uid);
    return c ? carta(this.cat, c.id, c.trasformata).nome : '?';
  }

  // ---------- selezione ----------
  private mossePerCarta(uid: number): Gioca[] {
    const v = this.vista();
    const c = v.mano.find((x) => x.uid === uid);
    if (!c) return [];
    const stesse = new Set(v.mano.filter((x) => x.id === c.id && x.trasformata === c.trasformata).map((x) => x.uid));
    return v.mosseLegali.filter((m): m is Gioca => m.t === 'gioca' && stesse.has(m.carta));
  }

  private candidate(): Gioca[] {
    if (this.selezione.carta === undefined) return [];
    return this.mossePerCarta(this.selezione.carta).filter(
      (m) => (this.selezione.terr === undefined || m.terr === this.selezione.terr) && (this.selezione.pres === undefined || m.pres === this.selezione.pres),
    );
  }

  /** La carta si puo' giocare (esiste almeno una mossa legale con le sue scelte). */
  giocabile(uid: number): boolean {
    return this.tuoTurno && !this.decisione && this.mossePerCarta(uid).length > 0;
  }

  opzioni(): Opzioni {
    const c = this.candidate();
    const terr = new Set<number>();
    const pres = new Set<number>();
    const cerca = new Set<string>();
    for (const m of c) {
      if (m.terr !== undefined && this.selezione.terr === undefined) terr.add(m.terr);
      if (m.pres !== undefined && this.selezione.pres === undefined) pres.add(m.pres);
      if (m.cerca !== undefined) cerca.add(m.cerca);
    }
    const pronta = c.length > 0 && terr.size === 0 && pres.size === 0 && cerca.size === 0;
    return { terr: [...terr], pres: [...pres], cerca: [...cerca], pronta };
  }

  scegliCarta(uid: number): void {
    if (this.selezione.carta === uid) {
      this.selezione = {};
      return;
    }
    this.selezione = this.giocabile(uid) ? { carta: uid } : {};
  }

  annulla(): void {
    this.selezione = {};
  }

  /** Tocco su un territorio mentre c'e' una carta selezionata. Ritorna true se la mossa e' stata giocata. */
  scegliTerritorio(t: number): boolean {
    if (this.selezione.carta === undefined || !this.opzioni().terr.includes(t)) return false;
    this.selezione.terr = t;
    return this.giocaSeUnica();
  }

  scegliPresenza(uid: number): boolean {
    if (this.selezione.carta === undefined || !this.opzioni().pres.includes(uid)) return false;
    this.selezione.pres = uid;
    return this.giocaSeUnica();
  }

  scegliCerca(id: string): boolean {
    const c = this.candidate().filter((m) => m.cerca === id);
    if (this.selezione.carta === undefined || !c.length) return false;
    this.applicaUmano({ ...c[0], carta: this.selezione.carta });
    return true;
  }

  /** Gioca la carta selezionata quando non servono altre scelte. */
  giocaSelezionata(): boolean {
    const o = this.opzioni();
    if (!o.pronta) return false;
    const m = this.candidate()[0];
    this.applicaUmano({ ...m, carta: this.selezione.carta! });
    return true;
  }

  private giocaSeUnica(): boolean {
    const c = this.candidate();
    const o = this.opzioni();
    // dopo il territorio non servono altre scelte: la mossa e' decisa
    if (c.length >= 1 && o.terr.length === 0 && o.pres.length === 0 && o.cerca.length === 0) {
      this.applicaUmano({ ...c[0], carta: this.selezione.carta! });
      return true;
    }
    return false;
  }

  // ---------- mosse dirette ----------
  private cerca(m: Mossa): Mossa | undefined {
    return this.vista().mosseLegali.find((x) => chiaveMossa(x) === chiaveMossa(m));
  }

  puoTappa(t: number): boolean {
    return this.tuoTurno && !this.decisione && !!this.cerca({ t: 'tappa', terr: t });
  }
  puoRidurre(): boolean {
    return this.tuoTurno && !this.decisione && !!this.cerca({ t: 'riduci' });
  }

  tappa(t: number): boolean {
    if (!this.puoTappa(t)) return false;
    this.applicaUmano({ t: 'tappa', terr: t });
    return true;
  }
  riduci(): boolean {
    if (!this.puoRidurre()) return false;
    this.applicaUmano({ t: 'riduci' });
    return true;
  }
  fine(): boolean {
    if (!this.tuoTurno || this.decisione) return false;
    this.applicaUmano({ t: 'fine' });
    return true;
  }
  riordina(ordine: number[]): boolean {
    if (!this.decisione) return false;
    this.applicaUmano({ t: 'riordina', ordine });
    return true;
  }

  private applicaUmano(m: Mossa): void {
    applica(this.g, this.umano, m);
    this.selezione = {};
    this.dopoMossa();
  }

  // ---------- computer ----------
  /** Il computer gioca UNA mossa; ritorna la frase che la spiega. */
  passoComputer(): string {
    const io = chiDeveMuovere(this.g);
    if (io === this.umano || this.finita) return '';
    const v = creaVista(this.g, io);
    applica(this.g, io, sceglieMossa(v, this.cat));
    this.dopoMossa();
    return this.messaggio;
  }

  /** Raccoglie le righe di cronaca nuove, ne ricava la frase e rileva un nuovo evento cosmico. */
  private dopoMossa(): void {
    const nuove = this.g.s.cronaca.slice(this.righeViste).filter((r) => !r.startsWith('---'));
    this.righeViste = this.g.s.cronaca.length;
    const frasi = nuove.map(frase);
    if (frasi.length) this.messaggio = frasi.join(' · ');
    const e = this.g.s.ultimoEvento;
    if (e && e !== this.ultimoEventoVisto) {
      this.ultimoEventoVisto = e;
      const def = this.cat.eventi.get(e)!;
      this.evento = { id: e, nome: def.nome, tipo: def.tipo, effetto: def.effetto, citazione: def.citazione };
    }
  }

  chiudiEvento(): void {
    this.evento = null;
  }

  // ---------- registro ----------
  registroTesto(): string {
    const s = this.g.s;
    return JSON.stringify(
      {
        gioco: 'Cosmic Horror - prototipo',
        fileCarte: this.cat.dati.fileCarte.split(/[\\/]/).pop(),
        fileEventi: this.cat.dati.fileEventi.split(/[\\/]/).pop(),
        seme: s.seme,
        primaFazione: s.giocatori[0].fazione,
        fazioneUmano: this.fazioneUmano,
        giri: s.giro,
        esito: s.vincitore === null ? (s.finitaPerLimite ? 'interrotta' : 'in corso') : s.giocatori[s.vincitore].fazione,
        mosse: s.registro,
      },
    );
  }
}

const VERBI: Record<string, string> = {
  gioca: 'giocano', finisce: 'finiscono', prende: 'prendono', riduce: 'riducono', ottiene: 'ottengono', scarta: 'scartano',
  riordina: 'riordinano', VINCE: 'VINCONO',
};

/** Una riga di cronaca resa leggibile. */
export function frase(riga: string): string {
  let r = riga.replace(/^SEGNALE: (custodi|risvegliati) e' a una tappa dalla vittoria/, (_m, f: string) => `SEGNALE! ${NOME_FAZIONE[f]} sono a una tappa dalla vittoria`);
  r = r.replace(/^(custodi|risvegliati) (\w+)/, (m, f: string, v: string) => (VERBI[v] ? `${NOME_FAZIONE[f]} ${VERBI[v]}` : m));
  r = r.replace(/\b(custodi|risvegliati)\b/g, (m) => NOME_FAZIONE[m]);
  return r.replace(/^EVENTO COSMICO: /, 'Evento cosmico: ').replace(/^VINCE/, 'Vittoria');
}
