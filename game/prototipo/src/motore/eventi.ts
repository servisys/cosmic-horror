// Forza cosmica: eventi di fine giro, instabilita' crescente ed effetti cosmici dei territori (Core Rules §6, §7, §11).
import { addEsp, addInst, aggiornaControllo, elimina, pesca, scartaCasuale, trasforma } from './operazioni.js';
import { esposizionePiuAlta, forzaPresenza, log, tuttePresenze, type Partita } from './queries.js';
import { faseDelGiro, REGOLE } from './regole.js';
import { mescola, scegli } from './rng.js';
import { NUM_TERR, type Mazzetto } from './stato.js';

/** Territorio piu' instabile; in parita' sorteggio con il seme della partita. */
function piuInstabile(g: Partita): number {
  const m = Math.max(...g.s.territori.map((t) => t.inst));
  const c = [0, 1, 2].filter((t) => g.s.territori[t].inst === m);
  return c.length === 1 ? c[0] : scegli(g.s, c);
}

export function creaMazzettiEventi(g: Partita): Record<'fase_I' | 'fase_II' | 'fase_III', Mazzetto> {
  const ev = g.cat.dati.eventi;
  const out = {} as Record<'fase_I' | 'fase_II' | 'fase_III', Mazzetto>;
  for (const k of ['fase_I', 'fase_II', 'fase_III'] as const) {
    const ids = ev[k].map((e) => e.id);
    // Un evento improvviso va nella fase II e uno nella fase III.
    for (const e of ev.improvvisi) if ('fase_' + e.fase === k) ids.push(e.id);
    out[k] = { mazzo: mescola(g.s, ids), scarti: [] };
  }
  return out;
}

/** Se il mazzetto della fase e' finito, si rimescola (con gli eventi gia' risolti di quella fase). */
export function assicuraMazzetto(g: Partita, fase: 'fase_I' | 'fase_II' | 'fase_III'): void {
  const mz = g.s.mazzettiEventi[fase];
  if (!mz.mazzo.length && mz.scarti.length) {
    mz.mazzo = mescola(g.s, mz.scarti);
    mz.scarti = [];
    log(g, `Il mazzetto degli eventi ${fase} si rimescola`);
  }
}

export function risolviEvento(g: Partita): void {
  const fase = faseDelGiro(g.s.giro);
  assicuraMazzetto(g, fase);
  const mz = g.s.mazzettiEventi[fase];
  const id = mz.mazzo.pop()!;
  mz.scarti.push(id);
  const ev = g.cat.eventi.get(id)!;
  log(g, `EVENTO COSMICO: ${ev.nome}`);
  const piuEsposti = esposizionePiuAlta(g);
  const tutte = () => tuttePresenze(g);
  switch (id) {
    case 'E01': addInst(g, piuInstabile(g), 1); break;
    case 'E02': {
      // Sul territorio con piu' presenze (in parita' sorteggio): -1 forza a tutte fino alla fine del giro successivo.
      const n = (t: number) => g.s.territori[t].presenze[0].length + g.s.territori[t].presenze[1].length;
      const m = Math.max(n(0), n(1), n(2));
      const c = [0, 1, 2].filter((t) => n(t) === m);
      const t = c.length === 1 ? c[0] : scegli(g.s, c);
      g.s.territori[t].malus = 1;
      g.s.territori[t].malusFinoAlGiro = g.s.giro + 1;
      break;
    }
    case 'E03': for (const p of piuEsposti) scartaCasuale(g, p, 1); break;
    case 'E04': for (let t = 0; t < NUM_TERR; t++) if (g.s.territori[t].inst === 0) addInst(g, t, 1); break;
    case 'E05': addInst(g, 2, 1); break;
    case 'E06': for (const p of [0, 1]) pesca(g, p, 1); break;
    case 'E07': addInst(g, piuInstabile(g), 2); break;
    case 'E08':
      for (const p of piuEsposti) {
        const mie = tutte().filter((x) => x.pi === p);
        if (!mie.length) continue;
        const f = (x: (typeof mie)[number]) => forzaPresenza(g, x.t, x.pi, x.p);
        const min = Math.min(...mie.map(f));
        const c = mie.filter((x) => f(x) === min);
        const v = c.length === 1 ? c[0] : scegli(g.s, c);
        elimina(g, v.t, v.pi, v.p, 'Shoggoth Affamato');
      }
      break;
    case 'E09': for (let t = 0; t < NUM_TERR; t++) addInst(g, t, 1); break;
    case 'E10': { const c = g.s.territori[0].controllo; if (c !== null) addEsp(g, c, 1); break; }
    case 'E11': for (const p of piuEsposti) scartaCasuale(g, p, 2); break;
    case 'E12': for (const p of piuEsposti) trasforma(g, p, 1); break;
    case 'E13': {
      const t = piuInstabile(g);
      addInst(g, t, 2);
      for (const q of [0, 1]) for (const p of g.s.territori[t].presenze[q]) p.bonus -= 1;
      break;
    }
    case 'E14': for (const p of piuEsposti) addEsp(g, p, 2); break;
    case 'E15': {
      for (let t = 0; t < NUM_TERR; t++) addInst(g, t, 1);
      eliminaDeboli(g, 1, 'Azathoth');
      break;
    }
    case 'E16': {
      const t = piuInstabile(g);
      const pres = tutte().filter((x) => x.t === t);
      if (pres.length) {
        const f = (x: (typeof pres)[number]) => forzaPresenza(g, x.t, x.pi, x.p);
        const max = Math.max(...pres.map(f));
        const c = pres.filter((x) => f(x) === max);
        const v = c.length === 1 ? c[0] : scegli(g.s, c);
        elimina(g, v.t, v.pi, v.p, "L'Orrore di Dunwich");
      }
      break;
    }
    case 'E17':
      for (let t = 0; t < NUM_TERR; t++) addInst(g, t, 1);
      for (const p of [0, 1]) if (g.s.giocatori[p].esposizione >= 6) scartaCasuale(g, p, 1);
      break;
    case 'E18':
      // "il piu' esposto" e' quello prima dell'aumento (vedi elenco ambiguita')
      for (const p of [0, 1]) addEsp(g, p, 1);
      for (const p of piuEsposti) addEsp(g, p, 1);
      break;
    case 'E19': for (let t = 0; t < NUM_TERR; t++) addInst(g, t, -1); break;
    case 'E20': for (const p of piuEsposti) trasforma(g, p, 2); break;
    default: throw new Error('Evento senza regola: ' + id);
  }
  aggiornaControllo(g);
}

/** Elimina tutte le presenze con forza effettiva <= soglia (calcolata prima di eliminare). */
export function eliminaDeboli(g: Partita, soglia: number, motivo: string): void {
  const v = tuttePresenze(g).filter((x) => forzaPresenza(g, x.t, x.pi, x.p) <= soglia);
  for (const x of v) elimina(g, x.t, x.pi, x.p, motivo);
}

/** Instabilita' crescente: dal giro 7 tutti i territori +1 alla fine di ogni giro. */
export function instabilitaCrescente(g: Partita): void {
  if (g.s.giro < REGOLE.giroInstabilitaCrescente) return;
  for (let t = 0; t < NUM_TERR; t++) addInst(g, t, 1);
  aggiornaControllo(g);
}

/** Effetti cosmici dei territori a instabilita' 5 (CT-DES-051), alla fine di ogni giro finche' restano a 5. */
export function effettiCosmiciTerritori(g: Partita): void {
  for (let t = 0; t < NUM_TERR; t++) {
    if (g.s.territori[t].inst !== REGOLE.sogliaEffettoCosmico) continue;
    const c = g.s.territori[t].controllo;
    if (t === 0 && c !== null) addEsp(g, c, 1);
    else if (t === 1 && c !== null) scartaCasuale(g, c, 1);
    else if (t === 2) {
      const v = tuttePresenze(g).filter((x) => x.t === 2 && forzaPresenza(g, 2, x.pi, x.p) <= 1);
      for (const x of v) elimina(g, x.t, x.pi, x.p, 'La Landa Maledetta');
    }
  }
  aggiornaControllo(g);
}

/** Fine dei malus temporanei (Nebbia dal Mare). */
export function scadenze(g: Partita): void {
  for (const t of g.s.territori) if (t.malus && g.s.giro >= t.malusFinoAlGiro) t.malus = 0;
  aggiornaControllo(g);
}

