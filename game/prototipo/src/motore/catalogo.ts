// Catalogo delle carte: id -> definizione effettiva (normale o cosmica). Costruito una volta dai dati.
import type { CartaDef, Dati, EventoDef, FazioneId } from '../dati/tipi.js';

export interface CartaEff {
  id: string;
  nome: string;
  tipo: 'presenza' | 'azione';
  costo: number;
  forza: number;
  potente: number;
  effetto: string;
  citazione: CartaDef['citazione'];
}

export interface Catalogo {
  dati: Dati;
  carte: Map<string, CartaDef>;
  fazioneDi: Map<string, FazioneId | 'riserva'>;
  territorioDiRiserva: Map<string, number>;
  eventi: Map<string, EventoDef>;
}

export function creaCatalogo(dati: Dati): Catalogo {
  const carte = new Map<string, CartaDef>();
  const fazioneDi = new Map<string, FazioneId | 'riserva'>();
  const territorioDiRiserva = new Map<string, number>();
  for (const f of dati.fazioni) for (const c of f.carte) { carte.set(c.id, c); fazioneDi.set(c.id, f.id); }
  dati.territori.forEach((t, i) => {
    for (const r of t.riserva) {
      carte.set(r.id, r);
      fazioneDi.set(r.id, 'riserva');
      territorioDiRiserva.set(r.id, i);
    }
  });
  const eventi = new Map<string, EventoDef>();
  for (const k of ['fase_I', 'fase_II', 'fase_III'] as const) for (const e of dati.eventi[k]) eventi.set(e.id, e);
  for (const e of dati.eventi.improvvisi) eventi.set(e.id, e);
  return { dati, carte, fazioneDi, territorioDiRiserva, eventi };
}

export function carta(cat: Catalogo, id: string, trasformata: boolean): CartaEff {
  const d = cat.carte.get(id);
  if (!d) throw new Error('Carta sconosciuta: ' + id);
  const v = trasformata ? d.versione_cosmica : undefined;
  return {
    id,
    nome: v?.nome ?? d.nome,
    tipo: d.tipo,
    costo: v?.costo ?? d.costo,
    forza: v?.forza ?? d.forza ?? 0,
    potente: v?.potente ?? d.potente ?? 0,
    effetto: v?.effetto ?? d.effetto,
    citazione: v?.citazione ?? d.citazione,
  };
}
