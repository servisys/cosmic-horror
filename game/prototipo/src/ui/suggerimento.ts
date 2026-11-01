// Aiuti di gioco: una riga che dice la prossima cosa utile, il motivo per cui un'azione non si puo' fare adesso e i testi del tutorial.
// Tutto e' calcolato dalla VISTA del giocatore (informazioni gia' visibili): non contiene regole e non muove nulla, e' solo un consiglio.
import type { Vista, VistaCarta, VistaTerritorio } from '../motore/vista.js';

export type TipoSuggerimento =
  | 'energia-finita'
  | 'avversario-un-passo'
  | 'puoi-tappa'
  | 'ultima-tappa'
  | 'apertura-tappa'
  | 'tappa-non-sicura'
  | 'instabilita'
  | 'forza-mancante'
  | 'pietre-ritte'
  | 'tocca-una-carta';

export interface Suggerimento {
  tipo: TipoSuggerimento;
  testo: string;
}

const nomeTappa = (v: Vista): string => (v.fazione === 'custodi' ? 'Sigillo' : 'rito');

function breve(nome: string): string {
  return nome.replace(/ e la Scogliera del Diavolo$/, '');
}
/** «a Innsmouth», «alla Biblioteca della Miskatonic». */
export function aT(nome: string): string {
  const n = breve(nome);
  return n.startsWith('La ') ? 'alla ' + n.slice(3) : 'a ' + n;
}
/** «di Innsmouth», «della Biblioteca della Miskatonic». */
export function diT(nome: string): string {
  const n = breve(nome);
  return n.startsWith('La ') ? 'della ' + n.slice(3) : 'di ' + n;
}

/** La prossima cosa utile da fare nel turno del giocatore; null se non e' il suo turno. */
export function suggerimento(v: Vista): Suggerimento | null {
  if (!v.mioTurno) return null;
  const mosse = v.mosseLegali;
  if (!mosse.length || mosse.some((m) => m.t === 'riordina')) return null; // scelta in sospeso (riordino della Biblioteca): la schermata la spiega
  const haMosseUtili = mosse.some((m) => m.t === 'gioca' || m.t === 'tappa' || m.t === 'riduci' || m.t === 'pietre');
  if (!haMosseUtili) return { tipo: 'energia-finita', testo: 'Hai finito l\'energia: tocca «Fine turno».' };

  // 1 - l'avversario e' a una tappa dalla vittoria
  if (v.tappeAvv === 2 && v.segnaleAvv) {
    return {
      tipo: 'avversario-un-passo',
      testo: v.fazione === 'custodi'
        ? 'ATTENZIONE: Lui è a una tappa dalla vittoria: l\'ultimo rito lo farà a R\'lyeh. Abbassa lì l\'instabilità sotto 3, gioca lì presenze per superarlo, o togli un suo rito.'
        : 'ATTENZIONE: Lui è a una tappa dalla vittoria: l\'ultimo Sigillo lo porrà a R\'lyeh. Alza lì l\'instabilità sopra 3, gioca lì presenze per togliergli il controllo, o togli un suo Sigillo.',
    };
  }
  // 2 - si puo' porre un Sigillo / completare un rito
  const tappa = mosse.find((m) => m.t === 'tappa');
  if (tappa && tappa.t === 'tappa') {
    const t = v.territori[tappa.terr];
    return {
      tipo: 'puoi-tappa',
      testo: `Puoi ${v.fazione === 'custodi' ? 'porre un Sigillo' : 'completare un rito'} ${aT(t.nome)}: tocca «${v.fazione === 'custodi' ? 'Poni Sigillo' : 'Completa rito'}» su quel territorio (costa ${t.costoTappa}).`,
    };
  }
  // 2a - con 2 tappe l'ultima si fa solo a R'lyeh (CT-DES-070): dice perche' non si puo' ancora e cosa preparare
  if (v.tappe >= 2) {
    const r = v.territori.find((t) => t.luogoUltimaTappa);
    if (r && !r.mioTappa) {
      const motivo = motivoTappa(v, r);
      return {
        tipo: 'ultima-tappa',
        testo: `Hai 2 tappe: l'ultima ${v.fazione === 'custodi' ? 'si pone' : 'si completa'} solo a R'lyeh${motivo ? ` (adesso: ${motivo})` : ''}. Prepara lì le tue presenze e l'instabilità.`,
      };
    }
  }
  // 2b - Formula di Dho-Hna / Studio del Necronomicon (CT-DES-068): la carta permette una tappa altrimenti impossibile e c'e' l'energia per carta + tappa
  if (!v.aperturaTappa) {
    const carte = v.mano.filter((c) => (c.id === 'CU14' || c.id === 'RI15') && mosse.some((m) => m.t === 'gioca' && m.carta === c.uid));
    for (const c of carte) {
      const t = v.territori.find((x) => x.tappaConApertura && x.costoTappa + c.costo <= v.energia);
      if (!t) continue;
      return {
        tipo: 'apertura-tappa',
        testo: c.id === 'CU14'
          ? `Con lo Studio del Necronomicon puoi porre un Sigillo ${aT(t.nome)} anche se l'instabilità è 4: giocalo, poi tocca «Poni Sigillo» (costa ${c.costo} la carta e ${t.costoTappa} il Sigillo).`
          : `Con la Formula di Dho-Hna puoi completare un rito ${aT(t.nome)} anche se l'instabilità è 2: giocala, poi tocca «Completa rito» (costa ${c.costo} la carta e ${t.costoTappa} il rito).`,
      };
    }
  }
  // 3 - una tappa mia non e' ancora al sicuro
  const insicura = v.territori.find((t) => t.mioTappa && t.mioTappaTogliibile);
  if (insicura) {
    return {
      tipo: 'tappa-non-sicura',
      testo: `Il tuo ${nomeTappa(v)} ${aT(insicura.nome)} non è ancora al sicuro: lo diventa alla fine del prossimo turno di Lui.`,
    };
  }
  // 4 - l'instabilita' non e' dalla parte giusta
  const sp = v.aperturaTappa ? 1 : 0;
  if (v.fazione === 'custodi') {
    const alta = v.territori.find((t) => t.inst > 3 + sp && !t.mioTappa && (t.controllo === 'io' || t.mie.length > 0));
    if (alta) {
      return { tipo: 'instabilita', testo: `L'instabilità ${diT(alta.nome)} è salita sopra 3: lì non puoi più porre Sigilli finché non la abbassi.` };
    }
  } else {
    const bassa = v.territori.find((t) => t.inst < 3 - sp && !t.mioTappa && t.mie.length > 0);
    if (bassa) {
      return { tipo: 'instabilita', testo: `${aT(bassa.nome).replace(/^a /, 'A ').replace(/^alla /, 'Alla ')} l'instabilità è ${bassa.inst}: servono 3 o più per completare un rito. Alzala con le tue carte.` };
    }
  }
  // 5 - serve piu' forza per controllare un territorio
  const presenzaGiocabile = (t: VistaTerritorio): boolean =>
    mosse.some((m) => m.t === 'gioca' && m.terr === t.indice && v.mano.find((c) => c.uid === m.carta)?.tipo === 'presenza');
  const carenti = v.territori
    .filter((t) => !t.mioTappa && t.forzaMia <= t.forzaLoro && presenzaGiocabile(t))
    // prima i territori dove Lui ha forza (contesi), poi gli altri; a parita' quello dove manca meno forza
    .sort((a, b) => (a.forzaLoro > 0 ? 0 : 1) - (b.forzaLoro > 0 ? 0 : 1) || a.forzaLoro - a.forzaMia - (b.forzaLoro - b.forzaMia));
  if (carenti.length) {
    const t = carenti[0];
    const n = t.forzaLoro - t.forzaMia + 1;
    if (t.forzaLoro === 0 && t.forzaMia === 0) {
      return { tipo: 'forza-mancante', testo: `Gioca una presenza ${aT(t.nome)}: ora nessuno lo controlla, con una presenza lo prendi.` };
    }
    return { tipo: 'forza-mancante', testo: `Gioca una presenza ${aT(t.nome)}: ti ${n === 1 ? 'manca 1 punto' : `mancano ${n} punti`} di forza per controllarlo.` };
  }
  // 5b - Pietre ritte di Dunwich
  if (mosse.some((m) => m.t === 'pietre')) {
    return { tipo: 'pietre-ritte', testo: 'Controlli Dunwich: con «Pietre ritte» (1 energia) sposti di 1 l\'instabilità di un altro territorio, una volta per turno.' };
  }
  // 6 - qualcosa da giocare
  return { tipo: 'tocca-una-carta', testo: `Hai ${v.energia} di energia: tocca una carta e poi il quadro che si illumina. Tieni premuto su una carta per leggerla.` };
}

/** Nella scena del territorio: le tue presenze e cosa ti manca per prenderlo (solo numeri gia' visibili nella vista). */
export function cosaManca(t: VistaTerritorio): string {
  const mie = t.mie.length ? `${t.mie.length} (forza ${t.forzaMia})` : 'nessuna';
  const servono = t.forzaLoro + 1;
  const mancano = servono - t.forzaMia;
  if (t.controllo === 'io') return `Le tue presenze: ${mie}.
Lo controlli tu.`;
  return `Le tue presenze: ${mie}.
Ti servono ${servono} di forza per prenderlo${t.forzaMia > 0 ? ` (te ne mancano ${mancano})` : ''}.`;
}

/** Perche' non si puo' porre il Sigillo / completare il rito su un territorio adesso; null se si puo' (o non e' il tuo turno ma e' possibile). */
export function motivoTappa(v: Vista, t: VistaTerritorio): string | null {
  if (!v.mioTurno) return 'turno di Lui';
  if (t.mioTappa) return `${nomeTappa(v)} già ${v.fazione === 'custodi' ? 'posto' : 'completato'}`;
  if (v.mosseLegali.some((m) => m.t === 'tappa' && m.terr === t.indice)) return null;
  // CT-DES-070: le prime due tappe sugli esterni, la terza solo a R'lyeh
  if (t.luogoUltimaTappa && v.tappe < 2) return 'prima servono 2 tappe';
  if (!t.luogoUltimaTappa && v.tappe >= 2) return 'ora solo a R\'lyeh';
  const sp = v.aperturaTappa ? 1 : 0;
  if (v.fazione === 'custodi') {
    if (t.controllo !== 'io') return 'non controlli';
    if (t.inst > 3 + sp) return `instabilità ${t.inst} (max ${3 + sp})`;
  } else {
    if (t.mie.length === 0) return 'serve una tua presenza';
    if (t.forzaMia < t.forzaLoro) return 'forza di Lui maggiore';
    if (t.inst < 3 - sp) return `instabilità ${t.inst} (servono ${3 - sp})`;
  }
  if (t.tappaPossibile && v.energia < t.costoTappa) return `serve ${t.costoTappa} energia`;
  if (v.tappe >= 2 && !v.segnaleMio) return 'dopo il turno di Lui';
  if (v.tappe >= 2) return 'dopo il turno di avviso';
  return 'non adesso';
}

/** Perche' una carta della mano non si puo' giocare adesso. */
export function motivoCartaNonGiocabile(v: Vista, c: VistaCarta): string {
  if (!v.mioTurno) return `Non è il tuo turno: aspetta Lui.`;
  if (c.costo > v.energia) return `${c.nome}: costa ${c.costo}, hai ${v.energia} di energia.`;
  if (c.tipo === 'presenza') return `${c.nome}: in ogni territorio puoi avere al massimo 4 presenze.`;
  return `${c.nome}: adesso non c'è un bersaglio valido (per esempio serve una tua presenza o una tappa dell'avversario da togliere).`;
}

// ---------- tutorial ----------
export interface PassoTutorial {
  /** Area da evidenziare (id delle aree della scena); undefined = nessuna, il fumetto sta al centro. */
  area?: string;
  titolo: string;
  testo: string;
}

export function passiTutorial(fazione: 'custodi' | 'risvegliati'): PassoTutorial[] {
  const c = fazione === 'custodi';
  return [
    {
      titolo: 'Lo scopo',
      testo: c
        ? 'Vinci ponendo 3 Sigilli: due sui territori esterni e l\'ultimo a R\'lyeh, il pozzo al centro. Il Sigillo si pone dove controlli (più forza di Lui) e l\'instabilità è 3 o meno.'
        : 'Vinci completando 3 riti: due sui territori esterni e l\'ultimo a R\'lyeh, il pozzo al centro. Il rito si completa dove hai una presenza, almeno tanta forza quanto Lui e l\'instabilità è 3 o più.',
    },
    { area: 'pannello:energia', titolo: 'L\'energia', testo: 'Questa è l\'energia che puoi spendere in questo turno. Ogni carta costa energia (il numero nella gemma blu in alto a destra della carta). Quella non spesa si perde.' },
    { area: 'mano:tutta', titolo: 'La mano', testo: 'Tocca una carta (la mano si alza), poi il quadro che si illumina d\'oro per giocarla. Per leggere una carta ingrandita, tienila premuta.' },
    { area: 'territori:tutti', titolo: 'I territori', testo: 'Ogni targhetta mostra la forza di Lui (verde) e la tua (blu): controlla chi ne ha di più. I pallini sono l\'instabilità: a 3 cambia chi può fare cosa, a 4 le presenze perdono forza, a 5 scatta un effetto cosmico.' },
    {
      area: 'btn:tappa:1',
      titolo: c ? 'Il Sigillo' : 'Il rito',
      testo: c
        ? 'Quando compare il bottone dorato «Poni Sigillo» puoi usarlo (costa 2 energia). Una tappa si può togliere finché non è «al sicuro»: lo diventa dopo il prossimo turno di Lui.'
        : 'Quando compare il bottone dorato «Completa rito» puoi usarlo (costa 2 energia). Una tappa si può togliere finché non è «al sicuro»: lo diventa dopo il prossimo turno di Lui.',
    },
    { area: 'btn:fine', titolo: 'Fine turno', testo: 'Quando hai finito, tocca «Fine turno»: gioca Lui, poi agisce la forza cosmica con un evento. La riga di suggerimento in alto ti dice la prossima cosa utile; toccala per nasconderla.' },
  ];
}
