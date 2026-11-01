// Il computer (CT-DES-016, CT-DES-074): regole fisse con le priorita' di fazione della Core Rules §10 (cinque territori).
// Riceve SOLO la vista del proprio giocatore (nessuna carta nascosta dell'avversario) e sceglie fra le mosse legali.
// Non usa il generatore casuale: stessa vista, stessa mossa.
// Non conosce id ne' indici dei territori: R'lyeh si riconosce da `luogoUltimaTappa`, Pietre ritte e Pietra Incisa dalle mosse legali.
import type { Catalogo } from '../motore/catalogo.js';
import type { Vista, VistaCarta, VistaPresenza, VistaTerritorio } from '../motore/vista.js';
import type { Mossa } from '../motore/stato.js';

type Gioca = Extract<Mossa, { t: 'gioca' }>;
type Pietre = Extract<Mossa, { t: 'pietre' }>;
interface Cand { m: Mossa; punti: number }

const ID_CUSTODI = {
  quiete: 'CU10', respiro: 'CU11', rinforzi: 'CU12', esorcismo: 'CU13', preparaSigillo: 'CU14', contenimento: 'CU17', pietra: 'CU09',
};
const ID_RISVEGLIATI = {
  sussurro: 'RI10', profanazione: 'RI12', preparaRito: 'RI15', squarcio: 'RI17', abbraccio: 'RI16', richiamo: 'RI18',
};
// Carta della riserva di R'lyeh (CT-DES-073)
const ID_IDOLO = 'T5r';

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
const rlyeh = (v: Vista): VistaTerritorio => v.territori.find((t) => t.luogoUltimaTappa)!;
const esterni = (v: Vista): VistaTerritorio[] => v.territori.filter((t) => !t.luogoUltimaTappa);
const pietre = (v: Vista): Pietre[] => v.mosseLegali.filter((m): m is Pietre => m.t === 'pietre');
/** La Pietra Incisa e' l'unica carta che si gioca con la scelta del segno. */
const isIncisa = (m: Gioca): boolean => m.segno !== undefined;

// ---------- Custodi (CT-DES-074): 1 Risvegliati a 2 tappe: difende R'lyeh -> 2 Sigillo -> 3 presenze -> 4 esposizione -> 5 Pietre ritte ----------
function candidatiCustodi(v: Vista): Cand[] {
  const out: Cand[] = [];
  const g = giocate(v);
  const r = rlyeh(v);
  const avvDueTappe = v.tappeAvv >= 2;
  // R'lyeh e' minacciato se i Risvegliati vi hanno una presenza (l'ultima tappa si fa solo li')
  const minacciato = !r.loroTappa && r.loro.length > 0;
  // 1 - difende R'lyeh: abbassa l'instabilita' (carte, Pietra Incisa -1, Pietre ritte -1), gioca presenze per superarne la forza, toglie un rito
  if (avvDueTappe) {
    if (minacciato && r.inst >= 3) {
      for (const { m, c } of g) {
        if (c.id === ID_CUSTODI.quiete && m.terr === r.indice) out.push({ m, punti: 900 + r.inst });
        if (c.id === ID_CUSTODI.contenimento) out.push({ m, punti: 850 });
        if (isIncisa(m) && m.terr === r.indice && m.segno === -1) out.push({ m, punti: 880 });
      }
      for (const m of pietre(v)) if (m.terr === r.indice && m.segno === -1) out.push({ m, punti: 895 });
    }
    for (const { m, c } of g) {
      if (minacciato && c.tipo === 'presenza' && m.terr === r.indice && r.forzaMia <= r.forzaLoro) out.push({ m, punti: 800 + c.forza });
      if (c.id === ID_CUSTODI.esorcismo) out.push({ m, punti: 870 });
    }
  }
  // 2 - se puo', pone un Sigillo (azione base, oppure la Pietra Stellata che lo pone gratis); il motore dice se su un esterno o a R'lyeh
  for (const m of tappe(v)) out.push({ m, punti: 700 });
  for (const { m, c } of g) {
    if (c.id === ID_CUSTODI.pietra && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      // CT-DES-070: con meno di 2 tappe solo su un esterno, con 2 tappe solo a R'lyeh e dopo il turno di avviso
      const ultima = v.tappe >= 2;
      const ammessa = t.luogoUltimaTappa === ultima && (!ultima || v.ultimaTappaSbloccata);
      if (!t.mioTappa && t.inst <= 3 && t.forzaMia + c.forza > t.forzaLoro && ammessa) out.push({ m, punti: 720 });
    }
    // "Studio del Necronomicon" (CT-DES-068): solo se in questo turno permette un Sigillo altrimenti impossibile e c'e' l'energia per carta + Sigillo
    if (c.id === ID_CUSTODI.preparaSigillo && v.territori.some((t) => t.tappaConApertura && t.costoTappa + c.costo <= v.energia)) {
      out.push({ m, punti: 690 });
    }
  }
  // 3 - con meno di 2 tappe rinforza l'esterno piu' conteso; con 1 tappa comincia anche a mettere presenze a R'lyeh
  //     (in classifica con gli esterni, a parita' dopo di loro); con 2 tappe prepara R'lyeh con presenze fino a controllarlo
  const aree = v.tappe >= 2 ? [r] : v.tappe === 1 ? [...esterni(v), r] : esterni(v);
  const contesiAree = [...aree].sort((a, b) => conteso(a) - conteso(b));
  for (const { m, c } of g) {
    if (c.tipo !== 'presenza' || m.terr === undefined) continue;
    const t = territorio(v, m.terr);
    if (!contesiAree.includes(t)) continue;
    if (v.tappe >= 2 && t.controllo === 'io') continue; // R'lyeh e' gia' controllato
    out.push({ m, punti: 500 - contesiAree.indexOf(t) * 20 - (t.mioTappa ? 5 : 0) + c.forza + c.costo / 10 });
  }
  // 4 - se la sua esposizione e' 5 o piu', la abbassa
  if (v.esposizione >= 5) {
    for (const { m, c } of g) if (c.id === ID_CUSTODI.respiro) out.push({ m, punti: 400 });
    const rid = v.mosseLegali.find((m) => m.t === 'riduci');
    if (rid) out.push({ m: rid, punti: 390 });
  }
  // 5 - Pietre ritte e Pietra Incisa (-1): tiene R'lyeh a 3 o meno prima dell'ultima tappa e l'instabilita' bassa dove ha un Sigillo da porre
  //     (R'lyeh prima; a parita' di punteggio il territorio con indice piu' basso)
  const daAbbassare = (t: VistaTerritorio): number => {
    if (t.inst <= 3) return 0;
    if (t.luogoUltimaTappa) return 2;
    return v.tappe < 2 && t.controllo === 'io' && !t.mioTappa ? 1 : 0;
  };
  for (const m of pietre(v)) {
    const t = territorio(v, m.terr);
    if (m.segno === -1 && daAbbassare(t)) out.push({ m, punti: 380 + daAbbassare(t) * 5 - t.indice * 0.01 });
  }
  for (const { m } of g) {
    if (!isIncisa(m) || m.segno !== -1 || m.terr === undefined) continue;
    const t = territorio(v, m.terr);
    if (daAbbassare(t)) out.push({ m, punti: 370 + daAbbassare(t) * 5 - t.indice * 0.01 });
  }
  // fuori tabella: Idolo di Cthulhu, Sonno senza Sogni dove serve ai Sigilli, rinforzi
  const idolo = idoloRlyeh(g, r);
  if (idolo) out.push(idolo);
  const contesi = [...v.territori].sort((a, b) => conteso(a) - conteso(b));
  for (const { m, c } of g) {
    if (c.id === ID_CUSTODI.quiete && m.terr !== undefined) {
      const t = territorio(v, m.terr);
      if (t.inst >= 3 && !t.mioTappa) out.push({ m, punti: 300 + t.inst });
    }
    if (c.id === ID_CUSTODI.rinforzi && m.pres !== undefined) {
      const x = trovaPres(v, m.pres);
      if (x) out.push({ m, punti: 280 - contesi.indexOf(x.t) * 20 });
    }
  }
  return out;
}

// ---------- Risvegliati (CT-DES-074): 1 Custodi a 2 tappe: attacca R'lyeh -> 2 rito -> 3 presenze -> 4 carte potenti -> 5 Pietre ritte ----------
function candidatiRisvegliati(v: Vista): Cand[] {
  const out: Cand[] = [];
  const g = giocate(v);
  const r = rlyeh(v);
  const avvDueTappe = v.tappeAvv >= 2;
  // i Custodi possono porre l'ultimo Sigillo (a R'lyeh) se ne hanno il controllo e l'instabilita' e' 3 o meno
  const sigillo = !r.loroTappa && r.controllo === 'avv' && r.inst <= 3;
  // 1 - alza l'instabilita' di R'lyeh sopra 3 (carte, Pietra Incisa +1, Pietre ritte +1), toglie un Sigillo non consolidato,
  //     o gioca presenze a R'lyeh per togliergliene il controllo
  if (avvDueTappe) {
    for (const { m, c } of g) {
      if (c.id === ID_RISVEGLIATI.profanazione) out.push({ m, punti: 1000 });
      if (!sigillo) continue;
      if (c.id === ID_RISVEGLIATI.sussurro && m.terr === r.indice) {
        const aumento = c.trasformata ? 2 : 1;
        out.push({ m, punti: 900 + (r.inst + aumento > 3 ? 20 : 0) + r.inst });
      }
      if (isIncisa(m) && m.terr === r.indice && m.segno === 1) out.push({ m, punti: 890 });
      if (c.id === ID_RISVEGLIATI.squarcio && r.inst >= 3) out.push({ m, punti: 850 });
      if (c.tipo === 'presenza' && m.terr === r.indice) out.push({ m, punti: (c.id === 'RI01' ? 810 : 800) + r.inst + c.forza / 10 });
    }
    if (sigillo) for (const m of pietre(v)) if (m.terr === r.indice && m.segno === 1) out.push({ m, punti: 895 });
  }
  // 2 - se puo', completa un rito (esterno con meno di 2 tappe, R'lyeh con 2: lo dice il motore)
  for (const m of tappe(v)) out.push({ m, punti: 700 });
  for (const { m, c } of g) {
    // "Formula di Dho-Hna" (CT-DES-068): solo se in questo turno permette un rito altrimenti impossibile e c'e' l'energia per carta + rito
    if (c.id === ID_RISVEGLIATI.preparaRito && v.territori.some((t) => t.tappaConApertura && t.costoTappa + c.costo <= v.energia)) {
      out.push({ m, punti: 690 });
    }
  }
  // 3 - presenze su un territorio senza rito dove la sua forza e' minore o uguale a quella dell'avversario e dove l'instabilita' e' almeno 2
  //     oppure ha gia' una presenza (CT-DES-067): sugli esterni con meno di 2 tappe; anche a R'lyeh con 1 o piu' tappe;
  //     con 2 tappe solo a R'lyeh, fino ad avere una presenza e almeno la forza dell'avversario. Tra piu' territori sceglie l'instabilita' piu' alta.
  for (const { m, c } of g) {
    if (c.tipo !== 'presenza' || m.terr === undefined) continue;
    const t = territorio(v, m.terr);
    if (t.mioTappa) continue;
    if (t.luogoUltimaTappa ? v.tappe < 1 : v.tappe >= 2) continue;
    const contesa = t.forzaMia <= t.forzaLoro && (t.inst >= 2 || t.mie.length > 0);
    const preparaRito = v.tappe >= 2 && t.luogoUltimaTappa && (t.mie.length === 0 || t.forzaMia < t.forzaLoro);
    if (contesa || preparaRito) out.push({ m, punti: 650 + t.inst * 5 + c.forza - (t.luogoUltimaTappa ? 0.5 : 0) });
  }
  // 4 - gioca le carte potenti quando ha l'energia
  for (const { m, c } of g) {
    if (c.potente <= 0 || c.id === ID_IDOLO) continue; // l'Idolo e' fuori tabella
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
  // 5 - Pietre ritte e Pietra Incisa (+1): tiene R'lyeh a 3 o piu', altrimenti alza l'instabilita' dove ha presenze
  //     (R'lyeh prima; a parita' di punteggio il territorio con indice piu' basso)
  const daAlzare = (t: VistaTerritorio): number => {
    if (t.luogoUltimaTappa) return t.inst < 3 ? 2 : 0;
    return r.inst >= 3 && t.mie.length > 0 && t.inst < 5 && !t.mioTappa ? 1 : 0;
  };
  for (const m of pietre(v)) {
    const t = territorio(v, m.terr);
    if (m.segno === 1 && daAlzare(t)) out.push({ m, punti: 440 + daAlzare(t) * 5 - t.indice * 0.01 });
  }
  for (const { m } of g) {
    if (!isIncisa(m) || m.segno !== 1 || m.terr === undefined) continue;
    const t = territorio(v, m.terr);
    if (daAlzare(t)) out.push({ m, punti: 430 + daAlzare(t) * 5 - t.indice * 0.01 });
  }
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
  // fuori tabella: Idolo di Cthulhu
  const idolo = idoloRlyeh(g, r);
  if (idolo) out.push(idolo);
  return out;
}

// Idolo di Cthulhu (fuori tabella, CT-DES-074): solo se ha una presenza a R'lyeh e il controllo e' contestato
// (l'avversario vi ha presenze e la mia forza non supera la sua).
function idoloRlyeh(g: { m: Gioca; c: VistaCarta }[], r: VistaTerritorio): Cand | undefined {
  if (!r.mie.length || !r.loro.length || r.forzaMia > r.forzaLoro) return undefined;
  const x = g.find(({ m, c }) => c.id === ID_IDOLO && m.pres !== undefined && r.mie.some((p) => p.uid === m.pres));
  return x ? { m: x.m, punti: 270 } : undefined;
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
