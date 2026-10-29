import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { creaGioco, fineTurno, giocaCarta, carteInMano, type Fixture } from '../src/logic/game';

const percorso = fileURLToPath(new URL('../../fixture/fixture.json', import.meta.url));
const dati = JSON.parse(readFileSync(percorso, 'utf-8'));
const fixture = dati as Fixture;

describe('logica della fetta (senza interfaccia)', () => {
  it('carta-territorio: la carta della persona imposta lo stato', () => {
    const g = giocaCarta(creaGioco(fixture), 'C1');
    expect(g.stato).toBe('stato-uno');
    expect(carteInMano(g)).toHaveLength(0);
  });

  it('una carta non in mano non si gioca', () => {
    expect(() => giocaCarta(creaGioco(fixture), 'C2')).toThrow();
  });

  it('avversario minimo: gioca la sua carta una volta, poi passa', () => {
    let g = giocaCarta(creaGioco(fixture), 'C1');
    g = fineTurno(g);
    expect(g.stato).toBe('stato-due');
    g = fineTurno(g);
    expect(g.log.some((r) => r.includes('Avversario passa'))).toBe(true);
  });

  it('evento cosmico: scatta una sola volta al round previsto', () => {
    let g = giocaCarta(creaGioco(fixture), 'C1');
    g = fineTurno(g);
    expect(g.eventiScattati).toEqual([]);
    g = fineTurno(g);
    expect(g.eventiScattati).toEqual(['E1']);
    expect(g.stato).toBe('stato-evento');
    g = fineTurno(g);
    expect(g.eventiScattati).toEqual(['E1']);
  });

  it('sequenza di prova condivisa dalla fixture', () => {
    let g = creaGioco(fixture);
    for (const passo of dati.sequenza_di_prova) {
      g = passo.azione === 'gioca' ? giocaCarta(g, passo.carta) : fineTurno(g);
      expect({ stato: g.stato, round: g.round, eventi_scattati: g.eventiScattati }).toEqual(passo.atteso);
    }
  });
});
