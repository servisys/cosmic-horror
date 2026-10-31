// Una partita computer contro computer, dal seme alla fine.
import { sceglieMossa } from '../computer/computer.js';
import type { Catalogo } from '../motore/catalogo.js';
import { applica, chiDeveMuovere, creaPartita, finita, type OpzioniPartita } from '../motore/motore.js';
import type { Partita } from '../motore/queries.js';
import { creaVista } from '../motore/vista.js';

export function giocaComputerControComputer(cat: Catalogo, opz: OpzioniPartita, maxMosse = 20000): Partita {
  const g = creaPartita(cat, opz);
  let n = 0;
  while (!finita(g)) {
    if (n++ > maxMosse) throw new Error(`Partita con seme ${opz.seme} oltre ${maxMosse} mosse`);
    const io = chiDeveMuovere(g);
    applica(g, io, sceglieMossa(creaVista(g, io), cat));
  }
  return g;
}
