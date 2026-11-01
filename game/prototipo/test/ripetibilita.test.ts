// Ripetibilita' (CT-DES-019): stesso seme e stesse mosse danno la stessa partita. E controllo dei dati.
import { describe, expect, it } from 'vitest';
import { caricaDati } from '../src/dati/caricamento.js';
import { controllaDati } from '../src/dati/controllo.js';
import { creaPartita, riproduci } from '../src/motore/motore.js';
import { giocaComputerControComputer } from '../src/simulazione/partita.js';
import { cat } from './aiuti.js';

describe('ripetibilita delle partite (CT-DES-019)', () => {
  it('stesso seme, stesso computer: stessa partita, mossa per mossa', () => {
    for (const seme of [0, 1, 2, 7, 99, 12345]) {
      const a = giocaComputerControComputer(cat, { seme });
      const b = giocaComputerControComputer(cat, { seme });
      expect(JSON.stringify(a.s)).toBe(JSON.stringify(b.s));
    }
  });
  it('rigiocando il registro delle mosse dal seme si ottiene lo stesso stato finale', () => {
    for (const seme of [3, 4, 5, 6]) {
      const a = giocaComputerControComputer(cat, { seme });
      const b = riproduci(cat, { seme }, a.s.registro);
      expect(JSON.stringify(b.s)).toBe(JSON.stringify(a.s));
    }
  });
  it('semi diversi, partite diverse', () => {
    const a = giocaComputerControComputer(cat, { seme: 10 });
    const b = giocaComputerControComputer(cat, { seme: 11 });
    expect(JSON.stringify(a.s.registro)).not.toBe(JSON.stringify(b.s.registro));
  });
  it('lo stato e semplice da salvare: JSON e ritorno', () => {
    const a = giocaComputerControComputer(cat, { seme: 8 });
    const copia = JSON.parse(JSON.stringify(a.s));
    expect(copia).toEqual(a.s);
  });
  it('il sorteggio di chi inizia dipende solo dal seme', () => {
    const primi = new Set<string>();
    for (let seme = 0; seme < 40; seme++) primi.add(creaPartita(cat, { seme }).s.giocatori[0].fazione);
    expect(primi.size).toBe(2);
    expect(creaPartita(cat, { seme: 5 }).s.giocatori[0].fazione).toBe(creaPartita(cat, { seme: 5 }).s.giocatori[0].fazione);
  });
});

describe('lettura e controllo dei dati', () => {
  it('i file dati attuali non hanno errori', () => {
    const r = controllaDati(caricaDati());
    expect(r.errori).toEqual([]);
  });
  it('segnala una carta senza costo', () => {
    const d = structuredClone(caricaDati());
    delete (d.fazioni[0].carte[0] as { costo?: number }).costo;
    expect(controllaDati(d).errori.join('\n')).toContain('costo non valido');
  });
  it('segnala un id duplicato', () => {
    const d = structuredClone(caricaDati());
    d.fazioni[0].carte[1].id = d.fazioni[0].carte[0].id;
    expect(controllaDati(d).errori.join('\n')).toContain('id duplicato');
  });
  it('segnala un mazzo che non ha 40 carte', () => {
    const d = structuredClone(caricaDati());
    d.fazioni[1].carte[0].copie += 1;
    expect(controllaDati(d).errori.join('\n')).toContain('41 carte invece di 40');
  });
  it('segnala un testo di effetto cambiato nel file (il codice va rivisto)', () => {
    const d = structuredClone(caricaDati());
    d.fazioni[0].carte.find((c) => c.id === 'CU11')!.effetto = 'La tua esposizione -2.';
    expect(controllaDati(d).errori.join('\n')).toContain('CU11: il testo dell\'effetto e\' cambiato');
  });
  it('segnala un evento con tipo non valido e una citazione mancante', () => {
    const d = structuredClone(caricaDati());
    d.eventi.fase_I[0].tipo = 'boh' as never;
    delete (d.eventi.fase_II[0] as { citazione?: unknown }).citazione;
    const e = controllaDati(d).errori.join('\n');
    expect(e).toContain('tipo non valido');
    expect(e).toContain('citazione mancante');
  });
  it('segnala una carta nuova che il codice non conosce', () => {
    const d = structuredClone(caricaDati());
    const nuova = { ...d.fazioni[0].carte[0], id: 'CU99' };
    d.fazioni[0].carte.push(nuova);
    expect(controllaDati(d).errori.join('\n')).toContain('CU99: il codice non conosce questa carta');
  });
  it('i file V0.6 sono YAML 1.2 valido: letti senza correzioni e senza avvisi', () => {
    const r = controllaDati(caricaDati());
    expect(r.avvisi).toEqual([]);
    expect(caricaDati().fileCarte).toContain('_V0.6.yaml');
  });
  it('segnala una carta di riserva senza id', () => {
    const d = structuredClone(caricaDati());
    delete (d.territori[0].riserva[0] as { id?: string }).id;
    expect(controllaDati(d).errori.join(String.fromCharCode(10))).toContain('id mancante');
  });
});
