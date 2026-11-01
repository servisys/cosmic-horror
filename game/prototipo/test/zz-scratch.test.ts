// La vista segnala R'lyeh (luogo dell'ultima tappa) e lo sblocco dell'ultima tappa dopo il turno di avviso (usati dal computer).
// (Nome provvisorio del file: nato come prova di lavoro, da rinominare in `vista-cinque-territori.test.ts`.)
import { expect, it } from 'vitest';
import { creaVista } from '../src/motore/vista.js';
import { energia, finisci, mossa, partita, presenza } from './aiuti.js';

it('la vista indica R lyeh come luogo dell ultima tappa', () => {
  const v = creaVista(partita('custodi'), 0);
  expect(v.territori.map((t) => t.luogoUltimaTappa)).toEqual([false, false, false, false, true]);
});

it('ultimaTappaSbloccata: falso finche non passa il turno di avviso', () => {
  const g = partita('custodi');
  for (const t of [0, 1, 4]) presenza(g, 0, t, 'CU03');
  expect(creaVista(g, 0).ultimaTappaSbloccata).toBe(false);
  mossa(g, 0, { t: 'tappa', terr: 0 });
  mossa(g, 0, { t: 'tappa', terr: 1 });
  expect(creaVista(g, 0).ultimaTappaSbloccata).toBe(false); // stesso turno del segnale
  finisci(g, 0);
  finisci(g, 1);
  energia(g, 0, 10);
  expect(creaVista(g, 0).ultimaTappaSbloccata).toBe(true);
});
