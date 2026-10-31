// Un test per ognuno dei 20 eventi cosmici. L'evento si mette in cima al mazzetto e si chiudono i due turni del giro 1.
import { describe, expect, it } from 'vitest';
import { forzaPresenza } from '../src/motore/queries.js';
import { cat, esposizione, finisci, inst, mano, nuova, presenza, risolviEventoDi, totPresenze } from './aiuti.js';

const insts = (g: ReturnType<typeof nuova>) => g.s.territori.map((t) => t.inst);

describe('eventi cosmici', () => {
  it('E01 I Sogni si Diffondono: il territorio piu instabile +1', () => {
    const g = nuova();
    inst(g, 1, 2);
    risolviEventoDi(g, 'E01');
    expect(insts(g)).toEqual([0, 3, 0]);
  });
  it('E02 Nebbia dal Mare: sul territorio con piu presenze -1 forza fino alla fine del giro successivo', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU03');
    presenza(g, 0, 0, 'CU01');
    presenza(g, 1, 1, 'RI04');
    risolviEventoDi(g, 'E02');
    expect(g.s.territori[0].malus).toBe(1);
    expect(forzaPresenza(g, 0, 0, g.s.territori[0].presenze[0][0])).toBe(3);
    // il giro successivo: ancora attivo alla fine, poi finisce (nessun altro evento che lo cambi)
    g.s.mazzettiEventi.fase_I.mazzo.push('E06');
    finisci(g, 0);
    finisci(g, 1);
    expect(g.s.territori[0].malus).toBe(0);
  });
  it('E03 Incubi Ciclopici: il piu esposto scarta 1 carta a caso', () => {
    const g = nuova();
    esposizione(g, 1, 2);
    const n = g.s.giocatori[1].mano.length;
    // dopo l'evento il giocatore 0 inizia il giro 2 e pesca: la mano del giocatore 1 e' cambiata solo per lo scarto
    risolviEventoDi(g, 'E03');
    expect(g.s.giocatori[1].mano.length).toBe(n + 1 /* pesca del suo turno */ - 1);
    expect(g.s.giocatori[0].mano.length).toBeGreaterThan(0);
  });
  it('E04 La Marea di Innsmouth: ogni territorio con instabilita 0 sale a 1', () => {
    const g = nuova();
    inst(g, 2, 3);
    risolviEventoDi(g, 'E04');
    expect(insts(g)).toEqual([1, 1, 3]);
  });
  it('E05 Il Meteorite: la Landa Maledetta +1', () => {
    const g = nuova();
    risolviEventoDi(g, 'E05');
    expect(insts(g)).toEqual([0, 0, 1]);
  });
  it('E06 Rivelazione: ogni giocatore pesca 1 carta', () => {
    const g = nuova();
    const m = [g.s.giocatori[0].mazzo.length, g.s.giocatori[1].mazzo.length];
    risolviEventoDi(g, 'E06');
    // il turno di apertura del giro 2 fa pescare solo il giocatore 0 (1 carta), oltre alla pesca dell'evento
    expect(g.s.giocatori[1].mazzo.length).toBe(m[1] - 1 - 1); // pesca del turno 1 + evento... il giocatore 1 ha gia' pescato nel suo turno
    expect(g.s.giocatori[0].mazzo.length).toBe(m[0] - 1 - 1);
  });
  it('E07 Il Colore si Diffonde: il territorio piu instabile +2', () => {
    const g = nuova();
    inst(g, 0, 1);
    risolviEventoDi(g, 'E07');
    expect(insts(g)).toEqual([3, 0, 0]);
  });
  it('E08 Shoggoth Affamato: il piu esposto elimina la propria presenza con forza piu bassa', () => {
    const g = nuova();
    esposizione(g, 1, 3);
    presenza(g, 1, 0, 'RI04');
    presenza(g, 1, 1, 'RI01');
    presenza(g, 0, 0, 'CU01');
    risolviEventoDi(g, 'E08');
    expect(totPresenze(g, 1, 1)).toBe(0);
    expect(totPresenze(g, 0, 1)).toBe(1);
    expect(totPresenze(g, 0, 0)).toBe(1);
  });
  it('E09 Le Stelle si Allineano: tutti i territori +1', () => {
    const g = nuova();
    risolviEventoDi(g, 'E09');
    expect(insts(g)).toEqual([1, 1, 1]);
  });
  it('E10 Luci sulla Scogliera del Diavolo: chi controlla Innsmouth esposizione +1', () => {
    const g = nuova();
    presenza(g, 1, 0, 'RI04');
    risolviEventoDi(g, 'E10');
    expect(g.s.giocatori[1].esposizione).toBe(1);
    expect(g.s.giocatori[0].esposizione).toBe(0);
  });
  it('E11 Il Necronomicon Brucia: il piu esposto scarta 2 carte a caso', () => {
    const g = nuova();
    esposizione(g, 1, 2);
    const n = g.s.giocatori[1].mano.length;
    risolviEventoDi(g, 'E11');
    expect(g.s.giocatori[1].mano.length).toBe(n + 1 - 2);
  });
  it('E12 Il Richiamo di Dagon: il piu esposto, una carta del mazzo si trasforma', () => {
    const g = nuova();
    esposizione(g, 1, 2);
    risolviEventoDi(g, 'E12');
    expect(g.s.giocatori[1].mazzo.filter((c) => c.trasformata)).toHaveLength(1);
    expect(g.s.giocatori[0].mazzo.filter((c) => c.trasformata)).toHaveLength(0);
  });
  it('E13 R lyeh Emerge: il piu instabile +2; le presenze li hanno -1 forza fino a fine partita', () => {
    const g = nuova();
    inst(g, 2, 1);
    presenza(g, 0, 2, 'CU03');
    risolviEventoDi(g, 'E13');
    expect(g.s.territori[2].inst).toBe(3);
    expect(g.s.territori[2].presenze[0][0].bonus).toBe(-1);
  });
  it('E14 Nyarlathotep Cammina tra gli Uomini: il piu esposto +2 esposizione', () => {
    const g = nuova();
    esposizione(g, 0, 1);
    risolviEventoDi(g, 'E14');
    expect(g.s.giocatori[0].esposizione).toBe(3);
    expect(g.s.giocatori[1].esposizione).toBe(0);
  });
  it('E15 Azathoth, il Caos Cieco: tutti +1; ogni presenza con forza 1 o meno eliminata', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01'); // 2
    presenza(g, 0, 1, 'CU05'); // 1
    presenza(g, 1, 0, 'RI01'); // 1
    presenza(g, 1, 2, 'RI09'); // 0
    presenza(g, 1, 2, 'RI04'); // 4
    risolviEventoDi(g, 'E15');
    expect(insts(g)).toEqual([1, 1, 1]);
    expect(totPresenze(g, 0, 0)).toBe(1);
    expect(totPresenze(g, 1, 0)).toBe(0);
    expect(totPresenze(g, 2, 1)).toBe(1);
    expect(g.s.territori[2].presenze[1][0].carta.id).toBe('RI04');
  });
  it('E16 L Orrore di Dunwich: sul territorio piu instabile viene eliminata la presenza con forza piu alta', () => {
    const g = nuova();
    inst(g, 1, 2);
    presenza(g, 0, 1, 'CU01');
    presenza(g, 1, 1, 'RI04');
    risolviEventoDi(g, 'E16');
    expect(totPresenze(g, 1, 1)).toBe(0);
    expect(totPresenze(g, 1, 0)).toBe(1);
  });
  it('E17 Le Stelle sono Giuste: tutti +1; chi ha esposizione 6 o piu scarta 1 carta', () => {
    const g = nuova();
    esposizione(g, 1, 6);
    const n = g.s.giocatori[1].mano.length;
    risolviEventoDi(g, 'E17');
    expect(insts(g)).toEqual([1, 1, 1]);
    expect(g.s.giocatori[1].mano.length).toBe(n + 1 - 1);
  });
  it('E18 Il Sogno di Cthulhu: entrambi +1 esposizione; il piu esposto +1 in piu', () => {
    const g = nuova();
    esposizione(g, 1, 2);
    risolviEventoDi(g, 'E18');
    expect(g.s.giocatori[0].esposizione).toBe(1);
    expect(g.s.giocatori[1].esposizione).toBe(4);
  });
  it('E19 Cthulhu Torna a Dormire: tutti i territori -1', () => {
    const g = nuova();
    inst(g, 0, 3);
    inst(g, 1, 1);
    risolviEventoDi(g, 'E19');
    expect(insts(g)).toEqual([2, 0, 0]);
  });
  it('E20 Yog-Sothoth e la Porta: il piu esposto, due carte del mazzo si trasformano', () => {
    const g = nuova();
    esposizione(g, 1, 2);
    risolviEventoDi(g, 'E20');
    expect(g.s.giocatori[1].mazzo.filter((c) => c.trasformata)).toHaveLength(2);
  });
  it('in parita di esposizione l evento colpisce entrambi', () => {
    const g = nuova();
    risolviEventoDi(g, 'E14');
    expect(g.s.giocatori.map((p) => p.esposizione)).toEqual([2, 2]);
  });
  it('un improvviso mostra "?" e tutti gli eventi dei dati sono conosciuti dal motore', () => {
    expect(cat.eventi.get('E19')!.tipo).toBe('?');
    expect(cat.eventi.get('E20')!.tipo).toBe('?');
    expect(cat.eventi.size).toBe(20);
    void mano;
  });
});
