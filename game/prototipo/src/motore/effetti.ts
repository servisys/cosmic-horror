// Effetti delle carte. I file dati descrivono gli effetti solo a parole: qui ogni carta ha il suo codice, e accanto
// il testo con cui e' stato scritto. Il controllo dei dati (src/dati/controllo.ts) segnala se un testo nei file cambia.
import { addEsp, addInst, aggiornaControllo, aggiungiTappa, elimina, pesca, togliTappa } from './operazioni.js';
import {
  altro, eff, forzaPresenza, forzaTerritorio, log, tappaPosabile, tappaTogliibile, tuttePresenze, type Partita,
} from './queries.js';
import { faseDelGiro, REGOLE } from './regole.js';
import { NUM_TERR, type CartaIst, type Mossa, type Presenza } from './stato.js';

export type Param = { terr?: number; pres?: number; cerca?: string };

/** Testi degli effetti con cui e' scritto il codice qui sotto: [normale, cosmica]. */
export const TESTI_EFFETTO: Record<string, [string, string?]> = {
  CU01: [''],
  CU02: ["Quando entra: instabilita' di questo territorio -1.", "Quando entra: instabilita' di questo territorio -1 e peschi 1 carta."],
  CU03: ['', "Quando entra: instabilita' di questo territorio +1."],
  CU04: ['Le tue altre presenze su questo territorio hanno +1 forza.'],
  CU05: ["Finche' e' qui, l'instabilita' di questo territorio non puo' superare 3."],
  CU06: ['Quando entra: peschi 1 carta.', 'Quando entra: peschi 2 carte.'],
  CU07: ["All'inizio del tuo turno: instabilita' di questo territorio -1."],
  CU08: ["Non puo' essere eliminata da azioni che costano 2 o meno."],
  CU09: ['Quando entra: se qui puoi porre un Sigillo, lo poni senza pagare energia.'],
  CU10: ["Instabilita' di un territorio -1."],
  CU11: ['La tua esposizione -1.'],
  CU12: ['Una tua presenza ha +2 forza fino a fine partita.'],
  CU13: ['Rimuovi un rito avversario non ancora consolidato da un territorio che controlli.'],
  CU14: ['Il prossimo Sigillo che poni in questo turno costa 1 energia in meno.'],
  CU15: ['Elimina una presenza avversaria con forza 3 o meno.'],
  CU16: ['Peschi 2 carte.'],
  CU17: ["Instabilita' di tutti i territori -2."],
  CU18: ['Elimina tutte le presenze avversarie con forza 2 o meno su un territorio.'],
  RI01: ["Quando entra: instabilita' di questo territorio +1.", "Quando entra: instabilita' di questo territorio +2."],
  RI02: ["+1 forza se l'instabilita' di questo territorio e' 3 o piu'.", "+2 forza se l'instabilita' di questo territorio e' 3 o piu'."],
  RI03: ['Quando entra: peschi 1 carta.', 'Quando entra: peschi 2 carte.'],
  RI04: [''],
  RI05: ["All'inizio del tuo turno: instabilita' di questo territorio +1."],
  RI06: ['I riti su questo territorio costano 1 energia in meno.'],
  RI07: ['Quando entra: una presenza avversaria su questo territorio -1 forza.', 'Quando entra: una presenza avversaria su questo territorio -2 forza.'],
  RI08: [''],
  RI09: ['Conta come tua presenza per i riti, non per il controllo.'],
  RI10: ["Instabilita' di un territorio +1.", "Instabilita' di un territorio +2."],
  RI11: ['+2 energia in questo turno.'],
  RI12: ["Rimuovi un Sigillo avversario non ancora consolidato da un territorio con instabilita' 3 o piu', dove hai una presenza e almeno tanta forza quanto l'avversario."],
  RI13: ['Peschi 2 carte.'],
  RI14: ['Una presenza avversaria -2 forza fino a fine partita.'],
  RI15: ['Il prossimo rito che completi in questo turno costa 1 energia in meno.'],
  RI16: ['Una tua presenza ha +3 forza fino a fine partita.'],
  RI17: ["Instabilita' di tutti i territori +1; elimina una presenza avversaria con forza 2 o meno."],
  RI18: ['Elimina tutte le presenze con forza 3 o meno su un territorio, anche le tue.'],
  T1r: ['Peschi 1 carta e vedi il tipo dei prossimi 2 eventi cosmici.'],
  T2r: ['Cerca nel tuo mazzo una carta azione e mettila in mano.'],
  T3r: ['+1 energia in questo turno.'],
};

export function trovaPresenza(g: Partita, uid: number): { t: number; pi: number; p: Presenza } | undefined {
  return tuttePresenze(g).find((x) => x.p.uid === uid);
}

/** Specifica del bersaglio di ogni azione. */
type Bersaglio =
  | 'nessuno' | 'terr' | 'presPropria' | 'presAvv3' | 'presAvv' | 'presAvv2facolt' | 'esorcismo' | 'profanazione' | 'cerca';
const BERSAGLIO: Record<string, Bersaglio> = {
  CU10: 'terr', CU11: 'nessuno', CU12: 'presPropria', CU13: 'esorcismo', CU14: 'nessuno', CU15: 'presAvv3', CU16: 'nessuno',
  CU17: 'nessuno', CU18: 'terr', RI10: 'terr', RI11: 'nessuno', RI12: 'profanazione', RI13: 'nessuno', RI14: 'presAvv',
  RI15: 'nessuno', RI16: 'presPropria', RI17: 'presAvv2facolt', RI18: 'terr', T1r: 'nessuno', T2r: 'cerca', T3r: 'nessuno',
};

/** Combinazioni di parametri con cui si puo' giocare la carta (senza guardare l'energia). */
export function parametriPossibili(g: Partita, pi: number, c: CartaIst): Param[] {
  const cd = g.cat.carte.get(c.id)!;
  const gi = g.s.giocatori[pi];
  const o = altro(pi);
  if (cd.tipo === 'presenza') {
    const out: Param[] = [];
    for (let t = 0; t < NUM_TERR; t++) {
      const terr = g.s.territori[t];
      if (terr.presenze[pi].length >= REGOLE.maxPresenzeSuTerritorio) continue; // CT-DES-050
      if (c.id === 'RI07' && terr.presenze[o].length) for (const p of terr.presenze[o]) out.push({ terr: t, pres: p.uid });
      else out.push({ terr: t });
    }
    return out;
  }
  const spec = BERSAGLIO[c.id];
  if (!spec) throw new Error('Carta senza regola: ' + c.id);
  const tutte = tuttePresenze(g);
  switch (spec) {
    case 'nessuno': return [{}];
    case 'terr': return [0, 1, 2].map((terr) => ({ terr }));
    case 'presPropria': return tutte.filter((x) => x.pi === pi).map((x) => ({ pres: x.p.uid }));
    case 'presAvv': return tutte.filter((x) => x.pi === o).map((x) => ({ pres: x.p.uid }));
    case 'presAvv3':
      return tutte.filter((x) => x.pi === o && forzaPresenza(g, x.t, x.pi, x.p) <= 3).map((x) => ({ pres: x.p.uid }));
    case 'presAvv2facolt': {
      const v = tutte.filter((x) => x.pi === o && forzaPresenza(g, x.t, x.pi, x.p) <= 2);
      return v.length ? v.map((x) => ({ pres: x.p.uid })) : [{}];
    }
    case 'esorcismo':
      return [0, 1, 2].filter((t) => g.s.territori[t].controllo === pi && tappaTogliibile(g, o, t)).map((terr) => ({ terr }));
    case 'profanazione':
      return [0, 1, 2].filter((t) => {
        const terr = g.s.territori[t];
        return tappaTogliibile(g, o, t) && terr.inst >= REGOLE.sogliaSigillo && terr.presenze[pi].length > 0 &&
          forzaTerritorio(g, t, pi) >= forzaTerritorio(g, t, o);
      }).map((terr) => ({ terr }));
    case 'cerca': {
      const ids = [...new Set(gi.mazzo.filter((x) => g.cat.carte.get(x.id)!.tipo === 'azione').map((x) => x.id))].sort();
      return ids.length ? ids.map((cerca) => ({ cerca })) : [{}];
    }
  }
}

/** Territorio "coinvolto" dalla carta: serve alla regola delle carte potenti (CT-DES-058). */
export function territorioPerPotente(g: Partita, m: Extract<Mossa, { t: 'gioca' }>): number | undefined {
  if (m.terr !== undefined) return m.terr;
  if (m.pres !== undefined) return trovaPresenza(g, m.pres)?.t;
  return undefined;
}

export function eliminaDaAzione(g: Partita, t: number, pi: number, p: Presenza, costoCarta: number): void {
  // Fattoria Barricata (CU08): non puo' essere eliminata da azioni che costano 2 o meno.
  if (p.carta.id === 'CU08' && costoCarta <= 2) {
    log(g, `${eff(g, p.carta).nome} resiste (azione da ${costoCarta})`);
    return;
  }
  elimina(g, t, pi, p, 'azione');
}

/** Effetto di una presenza che entra in campo (la presenza e' gia' sul territorio). */
export function effettoIngresso(g: Partita, pi: number, pres: Presenza, t: number, m: Param): void {
  const id = pres.carta.id;
  const cos = pres.carta.trasformata;
  const o = altro(pi);
  switch (id) {
    case 'CU02': addInst(g, t, -1); if (cos) pesca(g, pi, 1); break;
    case 'CU03': if (cos) addInst(g, t, 1); break;
    case 'CU06': pesca(g, pi, cos ? 2 : 1); break;
    case 'CU09':
      aggiornaControllo(g);
      if (tappaPosabile(g, pi, t)) {
        log(g, 'Pietra Stellata di Mnar: Sigillo senza pagare energia');
        aggiungiTappa(g, pi, t);
      }
      break;
    case 'RI01': addInst(g, t, cos ? 2 : 1); break;
    case 'RI03': pesca(g, pi, cos ? 2 : 1); break;
    case 'RI07': {
      const v = m.pres !== undefined ? g.s.territori[t].presenze[o].find((x) => x.uid === m.pres) : undefined;
      if (v) v.bonus -= cos ? 2 : 1;
      break;
    }
    default: break;
  }
}

/** Effetto di una azione giocata (la carta e' gia' stata pagata e tolta dalla mano). */
export function effettoAzione(g: Partita, pi: number, c: CartaIst, m: Param): void {
  const gi = g.s.giocatori[pi];
  const o = altro(pi);
  const cos = c.trasformata;
  const costo = eff(g, c).costo;
  const vittima = m.pres !== undefined ? trovaPresenza(g, m.pres) : undefined;
  switch (c.id) {
    case 'CU10': addInst(g, m.terr!, -1); break;
    case 'RI10': addInst(g, m.terr!, cos ? 2 : 1); break;
    case 'CU11': addEsp(g, pi, -1); break;
    case 'CU12': if (vittima) vittima.p.bonus += 2; break;
    case 'RI16': if (vittima) vittima.p.bonus += 3; break;
    case 'CU13': togliTappa(g, o, m.terr!); break;
    case 'RI12': togliTappa(g, o, m.terr!); break;
    case 'CU14': case 'RI15': gi.scontoTappa += 1; break;
    case 'CU15': if (vittima) eliminaDaAzione(g, vittima.t, vittima.pi, vittima.p, costo); break;
    case 'CU16': case 'RI13': pesca(g, pi, 2); break;
    case 'CU17': for (let t = 0; t < NUM_TERR; t++) addInst(g, t, -2); break;
    case 'CU18': {
      const t = m.terr!;
      for (const p of [...g.s.territori[t].presenze[o]]) if (forzaPresenza(g, t, o, p) <= 2) eliminaDaAzione(g, t, o, p, costo);
      break;
    }
    case 'RI11': gi.energia += 2; break;
    case 'RI14': if (vittima) vittima.p.bonus -= 2; break;
    case 'RI17':
      for (let t = 0; t < NUM_TERR; t++) addInst(g, t, 1);
      if (vittima) eliminaDaAzione(g, vittima.t, vittima.pi, vittima.p, costo);
      break;
    case 'RI18': {
      const t = m.terr!;
      const bersagli = [0, 1].flatMap((q) => g.s.territori[t].presenze[q].map((p) => ({ q, p })));
      for (const { q, p } of bersagli) if (forzaPresenza(g, t, q, p) <= 3) eliminaDaAzione(g, t, q, p, costo);
      break;
    }
    case 'T1r':
      pesca(g, pi, 1);
      gi.eventiVisti = prossimiTipiEventi(g, 2);
      break;
    case 'T2r': {
      if (m.cerca) {
        const i = gi.mazzo.map((x) => x.id).lastIndexOf(m.cerca);
        if (i >= 0) gi.mano.push(...gi.mazzo.splice(i, 1));
      }
      break;
    }
    case 'T3r': gi.energia += 1; break;
    default: throw new Error('Azione senza effetto: ' + c.id);
  }
}

/** Tipi dei prossimi n eventi da risolvere (dal giro in corso in poi), come li vedrebbe chi li rivela. */
export function prossimiTipiEventi(g: Partita, n: number): string[] {
  const out: string[] = [];
  const usati: Record<string, number> = {};
  for (let giro = g.s.giro; out.length < n && giro < g.s.giro + n + 1; giro++) {
    const f = faseDelGiro(giro);
    const mz = g.s.mazzettiEventi[f].mazzo;
    const k = (usati[f] = (usati[f] ?? 0) + 1);
    const id = mz[mz.length - k];
    out.push(id ? g.cat.eventi.get(id)!.tipo : '?');
  }
  return out;
}
