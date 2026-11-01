// Dentro un territorio: quali carte si possono giocare li' (lo dice il motore) e cosa manca per prenderlo (solo numeri della vista).
import { describe, expect, it } from 'vitest';
import { creaVista } from '../src/motore/vista.js';
import { Controller } from '../src/ui/controller.js';
import { cosaManca } from '../src/ui/suggerimento.js';
import { cat, energia, mano, partita, presenza } from './aiuti.js';

/** Un controller sulla partita costruita dai test (il giocatore umano e' il primo, Custodi). */
function controller(g = partita('custodi')): Controller {
  const c = new Controller(cat.dati);
  c.g = g;
  c.umano = 0;
  return c;
}

describe('carte giocabili in un territorio', () => {
  it('le presenze si giocano in ogni territorio', () => {
    const g = partita('custodi');
    energia(g, 0, 10);
    mano(g, 0, 'CU01');
    const c = controller(g);
    const uid = c.vista().mano[0].uid;
    for (let i = 0; i < 3; i++) expect(c.carteGiocabiliIn(i)).toEqual([uid]);
  });
  it("fuori dal proprio turno non c'è nessuna carta da giocare", () => {
    const g = partita('custodi');
    mano(g, 0, 'CU01');
    const c = controller(g);
    expect(c.fine()).toBe(true);
    expect(c.tuoTurno).toBe(false);
    for (let i = 0; i < 3; i++) expect(c.carteGiocabiliIn(i)).toEqual([]);
  });
  it("una carta con una presenza come bersaglio si gioca dove c'è quella presenza", () => {
    // si cerca nei dati una carta dei Custodi che ha come bersaglio una presenza dell'avversario
    let trovata = false;
    for (const id of cat.carte.keys()) {
      if (!id.startsWith('CU')) continue;
      const g = partita('custodi');
      energia(g, 0, 10);
      presenza(g, 1, 1, 'RI04');
      presenza(g, 0, 2, 'CU01');
      mano(g, 0, id);
      const c = controller(g);
      const mosse = c.vista().mosseLegali.filter((m) => m.t === 'gioca' && m.pres !== undefined);
      if (!mosse.length) continue;
      trovata = true;
      const uid = c.vista().mano[0].uid;
      const pres = new Set(c.vista().territori.flatMap((t) => [...t.mie, ...t.loro]).filter((p) => mosse.some((m) => m.t === 'gioca' && m.pres === p.uid)).map((p) => p.uid));
      for (let i = 0; i < 3; i++) {
        const t = c.vista().territori[i];
        const qui = [...t.mie, ...t.loro].some((p) => pres.has(p.uid));
        if (qui) expect(c.carteGiocabiliIn(i), `${id} in ${i}`).toContain(uid);
      }
    }
    expect(trovata).toBe(true);
  });
});

describe('cosa ti manca per prendere un territorio', () => {
  const t = (mie: number, loro: number, controllo: 'io' | 'avv' | null) => ({
    indice: 0, nome: 'Innsmouth', inst: 0, controllo, mie: Array(mie ? 1 : 0).fill({ uid: 1 }), loro: [], forzaMia: mie, forzaLoro: loro, mioTappa: false, loroTappa: false,
    loroTappaTogliibile: false, mioTappaTogliibile: false, tappaPossibile: false, costoTappa: 2, riservaRimasta: 3,
  });
  it('nessuna presenza: servono forza di Lui + 1', () => {
    expect(cosaManca(t(0, 3, 'avv') as never)).toBe('Le tue presenze: nessuna.\nTi servono 4 di forza per prenderlo.');
  });
  it('con presenze: dice anche quanto manca', () => {
    expect(cosaManca(t(2, 3, 'avv') as never)).toBe('Le tue presenze: 1 (forza 2).\nTi servono 4 di forza per prenderlo (te ne mancano 2).');
  });
  it('se lo controlli lo dice', () => {
    expect(cosaManca(t(5, 3, 'io') as never)).toBe('Le tue presenze: 1 (forza 5).\nLo controlli tu.');
  });
  it('la vista non serve ad altro: i numeri vengono dalla vista vera', () => {
    const g = partita('custodi');
    presenza(g, 1, 0, 'RI04');
    const v = creaVista(g, 0);
    expect(cosaManca(v.territori[0])).toContain('Ti servono');
  });
});
