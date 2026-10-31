// Il computer (CT-DES-016, CT-DES-045): regole fisse con le priorita' di fazione della Core Rules §10.
// Riceve SOLO la vista del proprio giocatore (nessuna carta nascosta dell'avversario) e sceglie fra le mosse legali.
// Non usa il generatore casuale: stessa vista, stessa mossa.
import type { Catalogo } from '../motore/catalogo.js';
import type { Vista, VistaCarta, VistaPresenza, VistaTerritorio } from '../motore/vista.js';
import type { Mossa } from '../motore/stato.js';

type Gioca = Extract<Mossa, { t: 'gioca' }>;
interface Cand { m: Mossa; punti: number }

const ID_CUSTODI = {
  quiete: 'CU10', respiro: 'CU11', rinforzi: 'CU12', esorcismo: 'CU13', preparaSigillo: 'CU14', contenimento: 'CU17', pietra: 'CU09',
};
const ID_RISVEGLIATI = {
  sussurro: 'RI10', profanazione: 'RI12', preparaRito: 'RI15', squarcio: 'RI17', abbraccio: 'RI16', richiamo: 'RI18',
};

export function sceglieMossa(v: Vista, _cat: Catalogo): Mossa {
  const ml = v.mosseLegali;
  if (!ml.length) throw new Error('Nessuna mossa legale');
  const riordina = ml.find((m) => m.t === 'riordina');
  if (riordina) return riordina; // il computer non riordina: tiene l'ordine com'e'
  const fine = ml.find((m) => m.t === 'fine')!;
  const cand = v.fazione === 'custodi' ? candidatiCustodi(v) : candidatiRisvegliati(v);
  cand.push(...candidatiComuni(v));
  if (!cand.length) return fine;
  cand.sort((a, b) => b.punti - a.punti);
  return cand[0].m;
}

// ---------- utilita' ----------
const mano = (v: Vista, uid: number): VistaCarta => v.mano.find((c) => c.uid === uid)!;
const giocate = (v: Vista): { m: Gioca; c: VistaCarta }[] =>
  v.mosseLegali.filter((m): m is Gioca => m.t === 'gioca').map((m) => ({ m, c: mano(v, m.carta) }));
const tappe = (v: Vista) => v.mosseLegali.filter((m): m is Extract<Mossa, { t: 'tappa' }> => m.t === 'tappa');
const territorio = (v: Vista, t: number): VistaTerritorio => v.territori[t];
const trovaPres = (v: Vista, uid: number): { t: VistaTerritorio; p: VistaPresenza; mia: boolean } | undefined => {
  for (const t of v.territori) {
    const a = t.mie.find((p) => p.uid === uid);
    if (a) return { t, p: a, mia: true };
    const b = t.loro.find((p) => p.uid === uid);
    if (b) return { t, p: b, mia: false };
  }
  return undefined;
};
const conteso = (t: VistaTerritorio) => Math.abs(t.forzaMia - t.forzaLoro);

// ---------- Custodi: 1 avversario a un passo -> 2 Sigillo -> 3 rinforzo del territorio conteso -> 4 esposizione ----------
function candidatiCustodi(v: Vista): Cand[] {
  const out: Cand[] = [];
  const g = giocate(v);
  const avvUnPasso = v.tappeAvv === 2;
  // Territori in cui l'avversario puo' ancora completare un rito: senza una sua tappa; piu' a rischio con sue presenze e instabilita' alta.
  const minacciati = v.territori.filter((t) => !t.loroTappa && t.loro.length > 0);
  // 1 - l'avversario e' a un passo dalla vittoria
  if (avvUnPasso) {
    for (const { m, c } of g) {
      if (c.id === ID_CUSTODI.esorcismo) out.push({ m, punti: 1000 });
      if (c.id === ID_CUSTODI.quiete && m.terr !== undefined) {
        const t = territorio(v, m.terr);
        if (minacciati.includes(t) && t.inst >= 3) out.push({ m, punti: 900 + t.inst });
      }
      if (c.id === ID_CUSTODI.contenimento && minacciati.some((t) => t.inst >= 3)) out.push({ m, punti: 850 });
      // contesta il territorio: la presenza piu' forte dove l'avversario ha presenze e non ho il controllo
      if (c.tipo === 'presenza' && m.terr !== undefined) {
        const t = territorio(v, m.terr);
        if (minacciati.includes(t) && t.controllo !== 'io') out.push({ m, punti: 800 + c.forza });
      }
    }
  }
  // 2 - se puo', pone un Sigillo (azione base, oppure la Pietra Stellata che lo pone gratis)
  for (const m of tappe(v)) out.push({ m, punti: 700 });
  for (const { m, c } of g) {
    if (c.id === ID_CUSTODI.pietra && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      const ultimaAmmessa = v.tappe < 2 || v.segnaleMio;
      if (!t.mioTappa && t.inst <= 3 && t.forzaMia + c.forza > t.forzaLoro && ultimaAmmessa) out.push({ m, punti: 720 });
    }
    // "Studio del Necronomicon" quando manca 1 energia per il Sigillo
    if (c.id === ID_CUSTODI.preparaSigillo && v.territori.some((t) => t.tappaPossibile && t.costoTappa > v.energia && t.costoTappa - 1 <= v.energia - c.costo)) {
      out.push({ m, punti: 690 });
    }
  }
  // 3 - rinforza il territorio piu' conteso
  const contesi = [...v.territori].sort((a, b) => conteso(a) - conteso(b));
  for (const { m, c } of g) {
    if (c.tipo === 'presenza' && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      const rango = contesi.indexOf(t);
      out.push({ m, punti: 500 - rango * 20 - (t.mioTappa ? 5 : 0) + c.forza + c.costo / 10 });
    }
    if (c.id === ID_CUSTODI.rinforzi && m.pres !== undefined) {
      const x = trovaPres(v, m.pres);
      if (x) out.push({ m, punti: 480 - contesi.indexOf(x.t) * 20 });
    }
  }
  // 4 - se la sua esposizione e' 5 o piu', la abbassa
  if (v.esposizione >= 5) {
    for (const { m, c } of g) if (c.id === ID_CUSTODI.respiro) out.push({ m, punti: 400 });
    const r = v.mosseLegali.find((m) => m.t === 'riduci');
    if (r) out.push({ m: r, punti: 390 });
  }
  // dopo le priorita': abbassa l'instabilita' dove serve ai Sigilli
  for (const { m, c } of g) {
    if (c.id === ID_CUSTODI.quiete && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      if (t.inst >= 3 && !t.mioTappa) out.push({ m, punti: 300 + t.inst });
    }
  }
  return out;
}

// ---------- Risvegliati: 1 i Custodi a un passo -> 2 rito -> 3 carte potenti -> 4 instabilita' dove ha presenze ----------
function candidatiRisvegliati(v: Vista): Cand[] {
  const out: Cand[] = [];
  const g = giocate(v);
  const avvUnPasso = v.tappeAvv === 2;
  // dove i Custodi stanno per porre il Sigillo: senza loro tappa, instabilita' 3 o meno, loro controllo
  const sigilli = v.territori.filter((t) => !t.loroTappa && t.inst <= 3);
  if (avvUnPasso) {
    for (const { m, c } of g) {
      if (c.id === ID_RISVEGLIATI.profanazione) out.push({ m, punti: 1000 });
      if ((c.id === ID_RISVEGLIATI.sussurro) && m.terr !== undefined) {
        const t = territorio(v, m.terr);
        if (sigilli.includes(t) && t.inst <= 2) out.push({ m, punti: 900 + t.inst + (t.controllo === 'avv' ? 5 : 0) });
      }
      if (c.id === ID_RISVEGLIATI.squarcio && sigilli.some((t) => t.inst <= 2)) out.push({ m, punti: 850 });
      if (c.tipo === 'presenza' && m.terr !== undefined && ['RI01'].includes(c.id)) {
        const t = territorio(v, m.terr);
        if (sigilli.includes(t) && t.inst <= 2) out.push({ m, punti: 800 + t.inst });
      }
    }
  }
  // 2 - se puo', completa un rito
  for (const m of tappe(v)) out.push({ m, punti: 700 });
  for (const { m, c } of g) {
    if (c.id === ID_RISVEGLIATI.preparaRito && v.territori.some((t) => t.tappaPossibile && t.costoTappa > v.energia && t.costoTappa - 1 <= v.energia - c.costo)) {
      out.push({ m, punti: 690 });
    }
  }
  // 3 - gioca le carte potenti quando ha l'energia
  for (const { m, c } of g) {
    if (c.potente <= 0) continue;
    let punti = 600 + c.costo * 3 + c.potente;
    if (c.id === ID_RISVEGLIATI.abbraccio && m.pres !== undefined) {
      const x = trovaPres(v, m.pres);
      if (!x || !x.mia) continue;
      punti = 600 + x.p.forza;
    } else if (c.id === ID_RISVEGLIATI.squarcio) {
      if (m.pres === undefined) punti = 560;
    } else if (c.id === ID_RISVEGLIATI.richiamo && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      const mie = t.mie.filter((p) => p.forza <= 3).length;
      const loro = t.loro.filter((p) => p.forza <= 3).length;
      if (loro <= mie + 1) continue;
      punti = 610 + loro - mie;
    }
    out.push({ m, punti });
  }
  // 4 - alza l'instabilita' dove ha presenze
  for (const { m, c } of g) {
    if (c.id === ID_RISVEGLIATI.sussurro && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      if (t.mie.length > 0 && t.inst < 5 && !t.mioTappa) out.push({ m, punti: 450 + (t.inst < 3 ? 10 : 0) });
    }
    if (c.tipo === 'presenza' && c.id === 'RI01' && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      if (t.mie.length > 0 && !t.mioTappa) out.push({ m, punti: 440 });
    }
  }
  return out;
}

// ---------- scelte non previste dalla tabella delle priorita' (implementazione, vedi elenco delle ambiguita') ----------
function candidatiComuni(v: Vista): Cand[] {
  const out: Cand[] = [];
  for (const { m, c } of giocate(v)) {
    // carte della riserva gratuite che danno energia: prima di tutto, cosi' l'energia serve alle priorita'
    if (c.id === 'T3r') out.push({ m, punti: 2000 });
    else if (c.id === 'T1r' || c.id === 'T2r') out.push({ m, punti: 200 });
    else if (c.tipo === 'azione' && (c.id === 'CU16' || c.id === 'RI13') && c.potente <= 0) out.push({ m, punti: 250 });
    else if (c.tipo === 'presenza' && m.terr !== undefined) {
      // presenza di riempimento: dove la differenza di forza e' minore, evitando i territori dove ho gia' una tappa
      const t = territorio(v, m.terr);
      out.push({ m, punti: 100 + c.forza - conteso(t) - (t.mioTappa ? 3 : 0) + (m.pres !== undefined ? 1 : 0) });
    } else if (c.id === 'CU15' && m.pres !== undefined) {
      const x = trovaPres(v, m.pres);
      if (x) out.push({ m, punti: 150 + x.p.forza });
    } else if (c.id === 'CU18' && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      const n = t.loro.filter((p) => p.forza <= 2).length;
      if (n >= 2) out.push({ m, punti: 140 + n });
    } else if (c.id === 'RI14' && m.pres !== undefined) {
      const x = trovaPres(v, m.pres);
      if (x) out.push({ m, punti: 130 + x.p.forza });
    } else if (c.id === 'RI11' && v.esposizione < 8) {
      out.push({ m, punti: 120 });
    } else if (c.id === 'CU12' && m.pres !== undefined) {
      out.push({ m, punti: 110 });
    }
  }
  return out;
}
