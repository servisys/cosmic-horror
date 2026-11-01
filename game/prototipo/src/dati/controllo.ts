// Controllo dei dati: segnala dati mancanti o sbagliati e testi di effetto che non corrispondono piu' al codice.
import { TESTI_EFFETTO } from '../motore/effetti.js';
import { TERR } from '../motore/regole.js';
import { TESTI_EVENTO } from '../motore/testi-eventi.js';
import type { CartaDef, Citazione, Dati } from './tipi.js';

export interface EsitoControllo {
  errori: string[];
  avvisi: string[];
}

const TIPI_EVENTO = ['territorio', 'giocatore', 'campo', 'carte', '?'];

function testo(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}
function numero(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function controllaCitazione(c: Citazione | undefined, dove: string, e: string[]): void {
  if (!c) return void e.push(`${dove}: citazione mancante`);
  for (const k of ['testo', 'fonte', 'originale'] as const) if (!testo(c[k])) e.push(`${dove}: citazione.${k} mancante`);
}

function controllaCarta(c: CartaDef, dove: string, e: string[], w: string[]): void {
  if (!testo(c.id)) e.push(`${dove}: id mancante`);
  if (!testo(c.nome)) e.push(`${dove}: nome mancante`);
  if (c.tipo !== 'presenza' && c.tipo !== 'azione') e.push(`${dove}: tipo non valido (${String(c.tipo)})`);
  if (!numero(c.costo) || c.costo < 0) e.push(`${dove}: costo non valido`);
  if (c.tipo === 'presenza' && !numero(c.forza)) e.push(`${dove}: presenza senza forza`);
  if (c.tipo === 'azione' && c.forza !== undefined) w.push(`${dove}: azione con campo forza (ignorato)`);
  if (!numero(c.potente) || c.potente < 0) e.push(`${dove}: potente non valido`);
  if (!numero(c.copie) || c.copie < 1) e.push(`${dove}: copie non valide`);
  if (typeof c.effetto !== 'string') e.push(`${dove}: effetto mancante`);
  controllaCitazione(c.citazione, dove, e);
  const v = c.versione_cosmica;
  if (v) {
    if (!testo(v.nome)) e.push(`${dove}: versione cosmica senza nome`);
    if (!numero(v.costo)) e.push(`${dove}: versione cosmica senza costo`);
    if (typeof v.effetto !== 'string') e.push(`${dove}: versione cosmica senza effetto`);
    if (c.tipo === 'presenza' && v.forza !== undefined && !numero(v.forza)) e.push(`${dove}: versione cosmica con forza non valida`);
    controllaCitazione(v.citazione, dove + ' (cosmica)', e);
  }
}

function controllaTesto(id: string, c: CartaDef, e: string[]): void {
  const atteso = TESTI_EFFETTO[id];
  if (!atteso) return void e.push(`${id}: il codice non conosce questa carta (nessun effetto scritto)`);
  if (atteso[0] !== c.effetto) e.push(`${id}: il testo dell'effetto e' cambiato nel file, rivedere il codice. Nel file: "${c.effetto}" - nel codice: "${atteso[0]}"`);
  if (c.versione_cosmica) {
    const a = atteso[1] ?? atteso[0];
    if (a !== c.versione_cosmica.effetto) e.push(`${id}: il testo dell'effetto cosmico e' cambiato nel file, rivedere il codice. Nel file: "${c.versione_cosmica.effetto}" - nel codice: "${a}"`);
  } else if (atteso[1] !== undefined) e.push(`${id}: il codice prevede una versione cosmica che nel file non c'e'`);
}

export function controllaDati(d: Dati): EsitoControllo {
  const e: string[] = [];
  const w: string[] = [];
  const ids = new Set<string>();
  const unico = (id: string, dove: string) => {
    if (ids.has(id)) e.push(`${dove}: id duplicato ${id}`);
    ids.add(id);
  };
  // fazioni
  if (!Array.isArray(d.fazioni) || d.fazioni.length !== 2) e.push('Servono esattamente 2 fazioni');
  for (const f of d.fazioni ?? []) {
    if (f.id !== 'custodi' && f.id !== 'risvegliati') e.push(`Fazione sconosciuta: ${String(f.id)}`);
    let tot = 0;
    for (const c of f.carte ?? []) {
      const dove = `${f.id}/${c.id}`;
      unico(c.id, dove);
      controllaCarta(c, dove, e, w);
      controllaTesto(c.id, c, e);
      if (numero(c.copie)) tot += c.copie;
    }
    if (tot !== 40) e.push(`${f.id}: il mazzo ha ${tot} carte invece di 40 (CT-DES-025)`);
  }
  // territori
  if (!Array.isArray(d.territori) || d.territori.length !== 5) e.push('Servono esattamente 5 territori (CT-DES-069)');
  else if (d.territori.map((t) => t.id).join(',') !== Object.values(TERR).join(',')) {
    e.push(`I territori devono essere nell'ordine ${Object.values(TERR).join(', ')} (gli effetti si agganciano all'id)`);
  }
  for (const t of d.territori ?? []) {
    const dove = `territorio ${t.id}`;
    unico(t.id, dove);
    if (!testo(t.nome)) e.push(`${dove}: nome mancante`);
    if (!testo(t.effetto)) e.push(`${dove}: effetto mancante`);
    controllaCitazione(t.citazione, dove, e);
    if (!Array.isArray(t.riserva) || t.riserva.length !== 1) e.push(`${dove}: serve una sola carta di riserva`);
    for (const r of t.riserva ?? []) {
      unico(r.id, `${dove}/riserva`);
      controllaCarta(r, `${dove}/riserva`, e, w);
      controllaTesto(r.id, r, e);
      if (r.copie !== 3) e.push(`${dove}/riserva: servono 3 copie (Core Rules §5), nel file ${String(r.copie)}`);
    }
  }
  // eventi
  const ev = d.eventi;
  const tutti = [...(ev?.fase_I ?? []), ...(ev?.fase_II ?? []), ...(ev?.fase_III ?? []), ...(ev?.improvvisi ?? [])];
  if (tutti.length !== 20) e.push(`Servono 20 eventi, nel file ${tutti.length}`);
  for (const x of tutti) {
    const dove = `evento ${x.id}`;
    unico(x.id, dove);
    if (!testo(x.nome)) e.push(`${dove}: nome mancante`);
    if (!TIPI_EVENTO.includes(x.tipo)) e.push(`${dove}: tipo non valido (${String(x.tipo)})`);
    if (!testo(x.effetto)) e.push(`${dove}: effetto mancante`);
    controllaCitazione(x.citazione, dove, e);
    if (TESTI_EVENTO[x.id] === undefined) e.push(`${dove}: il codice non conosce questo evento`);
    else if (TESTI_EVENTO[x.id] !== x.effetto) e.push(`${dove}: il testo dell'effetto e' cambiato nel file, rivedere il codice`);
  }
  for (const x of ev?.improvvisi ?? []) {
    if (x.tipo !== '?') e.push(`evento ${x.id}: un evento improvviso deve avere tipo "?"`);
    if (x.fase !== 'II' && x.fase !== 'III') e.push(`evento ${x.id}: fase non valida (${String(x.fase)})`);
  }
  for (const id of Object.keys(TESTI_EVENTO)) if (!ids.has(id)) e.push(`${id}: il codice prevede un evento che non e' nel file`);
  for (const id of Object.keys(TESTI_EFFETTO)) if (!ids.has(id)) e.push(`${id}: il codice prevede una carta che non e' nel file`);
  return { errori: e, avvisi: w };
}
