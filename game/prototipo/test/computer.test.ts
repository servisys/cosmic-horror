// Il computer: mai mosse illegali, solo informazioni visibili, priorita' di fazione (Core Rules §10, CT-DES-045).
import { describe, expect, it } from 'vitest';
import { sceglieMossa } from '../src/computer/computer.js';
import { applica, chiDeveMuovere, chiaveMossa, creaPartita, finita } from '../src/motore/motore.js';
import { creaVista } from '../src/motore/vista.js';
import { cat, energia, esposizione, inst, mano, nuova, partita, presenza } from './aiuti.js';

const idCarta = (v: ReturnType<typeof creaVista>, m: ReturnType<typeof sceglieMossa>) =>
  m.t === 'gioca' ? v.mano.find((c) => c.uid === m.carta)!.id : m.t;

describe('il computer non fa mai mosse illegali', () => {
  it('300 partite computer contro computer: ogni mossa scelta e fra quelle legali e viene accettata dal motore', () => {
    let mosse = 0;
    for (let seme = 0; seme < 300; seme++) {
      const g = creaPartita(cat, { seme });
      while (!finita(g)) {
        const io = chiDeveMuovere(g);
        const v = creaVista(g, io);
        const m = sceglieMossa(v, cat);
        expect(v.mosseLegali.map(chiaveMossa)).toContain(chiaveMossa(m));
        applica(g, io, m); // lancia un errore se la mossa e' illegale
        mosse++;
      }
    }
    expect(mosse).toBeGreaterThan(10000);
  });
});

describe('il computer vede solo cio che e visibile (CT-DES-039)', () => {
  it('cambiando la mano e il mazzo dell avversario la vista e la mossa non cambiano', () => {
    let provate = 0;
    for (let seme = 0; seme < 20; seme++) {
      const g = creaPartita(cat, { seme });
      for (let i = 0; i < 12 && !finita(g); i++) {
        const io = chiDeveMuovere(g);
        applica(g, io, sceglieMossa(creaVista(g, io), cat));
      }
      if (finita(g)) continue;
      const io = chiDeveMuovere(g);
      const av = 1 - io;
      const v1 = creaVista(g, io);
      const m1 = sceglieMossa(v1, cat);
      // stessa partita, ma l'avversario ha altre carte in mano e un mazzo in ordine diverso
      const g2 = { s: structuredClone(g.s), cat };
      const gi = g2.s.giocatori[av];
      const tutte = [...gi.mano, ...gi.mazzo].reverse();
      const n = gi.mano.length;
      gi.mano = tutte.slice(0, n);
      gi.mazzo = tutte.slice(n);
      const v2 = creaVista(g2, io);
      expect(JSON.stringify(v2)).toBe(JSON.stringify(v1));
      expect(sceglieMossa(v2, cat)).toEqual(m1);
      provate++;
    }
    expect(provate).toBeGreaterThan(10);
  });
  it('la vista contiene i numeri delle carte dell avversario, non le carte', () => {
    const g = nuova();
    const v = creaVista(g, 0);
    expect(typeof v.nManoAvv).toBe('number');
    expect(JSON.stringify(v)).not.toContain('manoAvv"');
  });
});

describe('priorita dei Custodi', () => {
  it('2: se puo pone un Sigillo', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'tappa', terr: 0 });
  });
  it('1: se l avversario e a un passo dalla vittoria usa l Esorcismo di Armitage', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    mano(g, 0, 'CU13', 'CU01');
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('CU13');
  });
  it('1: se l avversario e a un passo abbassa l instabilita dove sta per completare il rito', () => {
    const g = partita('custodi');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    presenza(g, 1, 2, 'RI04');
    inst(g, 2, 4);
    mano(g, 0, 'CU10', 'CU01');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('CU10');
    expect(m.t === 'gioca' && m.terr).toBe(2);
  });
  it('3: rinforza il territorio piu conteso', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03'); // 4 contro 0: poco conteso
    presenza(g, 0, 1, 'CU01'); // 2 contro 2: conteso
    presenza(g, 1, 1, 'RI03');
    g.s.giocatori[0].tappe[0] = g.s.turniCompletati - 5;
    mano(g, 0, 'CU01');
    energia(g, 0, 1);
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(1);
  });
  it('4: con esposizione 5 o piu la abbassa', () => {
    const g = partita('custodi');
    esposizione(g, 0, 6);
    mano(g, 0, 'CU11');
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('CU11');
  });
});

describe('priorita dei Risvegliati', () => {
  it('2: se puo completa un rito', () => {
    const g = partita('risvegliati');
    presenza(g, 0, 0, 'RI04');
    inst(g, 0, 3);
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'tappa', terr: 0 });
  });
  it('1: se i Custodi sono a un passo usa Profanazione', () => {
    const g = partita('risvegliati');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    presenza(g, 0, 0, 'RI04');
    inst(g, 0, 3);
    g.s.giocatori[0].tappe[0] = 0; // rito gia' fatto qui: la tappa base non e' un'opzione
    mano(g, 0, 'RI12', 'RI01');
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('RI12');
  });
  it('1: se i Custodi sono a un passo alza l instabilita dove stanno per porre il Sigillo', () => {
    const g = partita('risvegliati');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    inst(g, 2, 1);
    presenza(g, 1, 2, 'CU03');
    mano(g, 0, 'RI10', 'RI01');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('RI10');
    expect(m.t === 'gioca' && m.terr).toBe(2);
  });
  it('3: gioca le carte potenti quando ha l energia', () => {
    const g = partita('risvegliati');
    mano(g, 0, 'RI01', 'RI08');
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('RI08');
  });
  it('4: alza l instabilita dove ha presenze', () => {
    const g = partita('risvegliati');
    presenza(g, 0, 1, 'RI01');
    mano(g, 0, 'RI10');
    energia(g, 0, 1);
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(1);
  });
});

describe('il computer e deterministico', () => {
  it('stessa vista, stessa mossa', () => {
    const g = nuova(5);
    const v = creaVista(g, 0);
    expect(sceglieMossa(v, cat)).toEqual(sceglieMossa(v, cat));
  });
});
