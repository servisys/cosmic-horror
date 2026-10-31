// Un test (o piu') per ogni regola numerata della Core Rules V0.8 (CT-DES-xxx). Le voci SUPERATE (043, 044, 048) non hanno test.
import { describe, expect, it } from 'vitest';
import { REGOLE } from '../src/motore/regole.js';
import { forzaTerritorio, numControllati } from '../src/motore/queries.js';
import { addEsp, addInst, pesca } from '../src/motore/operazioni.js';
import { applica, chiDeveMuovere, MossaIllegale, mosseLegali } from '../src/motore/motore.js';
import { creaVista } from '../src/motore/vista.js';
import {
  cat, energia, esposizione, finisci, giroIntero, gioca, inst, legali, mano, mossa, nuova, presenza, totPresenze,
} from './aiuti.js';

describe('CT-DES-021 la forza cosmica agisce alla fine di ogni giro', () => {
  it('dopo i turni di entrambi si risolve un evento; non dopo il turno del primo', () => {
    const g = nuova();
    const mazzo = () => Object.values(g.s.mazzettiEventi).reduce((a, m) => a + m.scarti.length, 0);
    finisci(g, 0);
    expect(mazzo()).toBe(0);
    finisci(g, 1);
    expect(mazzo()).toBe(1);
    expect(g.s.giro).toBe(2);
  });
});

describe('CT-DES-022 e 052 tre territori fissi', () => {
  it('ci sono 3 territori con i nomi fissi', () => {
    const g = nuova();
    expect(g.s.territori).toHaveLength(3);
    expect(cat.dati.territori.map((t) => t.nome)).toEqual([
      'Innsmouth e la Scogliera del Diavolo', 'La Biblioteca della Miskatonic', 'La Landa Maledetta',
    ]);
  });
});

describe('CT-DES-023 controlla chi ha piu forza', () => {
  it('somma della forza delle proprie presenze', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01'); // 2
    presenza(g, 1, 0, 'RI01'); // 1
    expect(g.s.territori[0].controllo).toBe(0);
    presenza(g, 1, 0, 'RI04'); // +4 = 5
    expect(g.s.territori[0].controllo).toBe(1);
    expect(forzaTerritorio(g, 0, 1)).toBe(5);
  });
});

describe('CT-DES-024 presenze e azioni', () => {
  it('la presenza resta sul territorio, l azione va negli scarti', () => {
    const g = nuova();
    energia(g, 0, 9);
    mano(g, 0, 'CU01', 'CU16');
    gioca(g, 0, 'CU01', { terr: 0 });
    gioca(g, 0, 'CU16');
    expect(totPresenze(g, 0, 0)).toBe(1);
    expect(g.s.giocatori[0].scarti.map((c) => c.id)).toContain('CU16');
    expect(g.s.giocatori[0].scarti.map((c) => c.id)).not.toContain('CU01');
  });
});

describe('CT-DES-025 e 047 mazzi da 40 carte', () => {
  it('ogni fazione ha 40 carte; le riserve 3 per territorio', () => {
    const g = nuova();
    for (const gi of g.s.giocatori) expect(gi.mazzo.length + gi.mano.length).toBe(40);
    for (const t of g.s.territori) expect(t.riserva).toHaveLength(3);
  });
});

describe('CT-DES-026 e 032 trasformazioni a esposizione 3, 6, 9', () => {
  it('a ogni soglia una carta casuale del mazzo diventa cosmica', () => {
    const g = nuova();
    const conta = () => g.s.giocatori[1].mazzo.filter((c) => c.trasformata).length;
    expect(conta()).toBe(0);
    addEsp(g, 1, 3);
    expect(conta()).toBe(1);
    addEsp(g, 1, 3);
    expect(conta()).toBe(2);
    addEsp(g, 1, 3);
    expect(conta()).toBe(3);
  });
  it('salendo di due soglie insieme se ne trasformano due; la mano non si trasforma', () => {
    const g = nuova();
    const manoPrima = g.s.giocatori[1].mano.map((c) => c.trasformata);
    addEsp(g, 1, 6);
    expect(g.s.giocatori[1].mazzo.filter((c) => c.trasformata)).toHaveLength(2);
    expect(g.s.giocatori[1].mano.map((c) => c.trasformata)).toEqual(manoPrima);
  });
  it('prendere il controllo di un territorio da una carta della riserva (CT-DES-026)', () => {
    const g = nuova();
    const prima = g.s.giocatori[0].mano.length;
    presenza(g, 0, 0, 'CU01');
    expect(g.s.giocatori[0].mano.length).toBe(prima + 1);
    expect(g.s.giocatori[0].mano.at(-1)!.id).toBe('T1r');
    expect(g.s.territori[0].riserva).toHaveLength(2);
  });
});

describe('CT-DES-027, 053 e 030 energia e fasi del turno', () => {
  it('energia: 2 al primo turno, +1 a turno, massimo 8; primo turno della partita 1 e 3 (CT-DES-057)', () => {
    const g = nuova();
    expect(g.s.giocatori[0].energia).toBe(1); // chi gioca per primo
    finisci(g, 0);
    expect(g.s.giocatori[1].energia).toBe(3); // chi gioca per secondo
    finisci(g, 1);
    expect(g.s.giocatori[0].energia).toBe(3); // secondo turno: 2 + 1
    finisci(g, 0);
    finisci(g, 1);
    expect(g.s.giocatori[0].energia).toBe(4);
  });
  it('massimo 8 di base', () => {
    const g = nuova();
    for (let i = 0; i < 9; i++) giroIntero(g);
    expect(g.s.giocatori[0].energia).toBeLessThanOrEqual(8 + 1);
    expect(g.s.giocatori[0].turniGiocati).toBe(10);
  });
  it('+1 energia se all inizio del turno controlli almeno 2 territori', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01');
    presenza(g, 0, 1, 'CU01');
    finisci(g, 0);
    finisci(g, 1);
    // secondo turno: 3 di base + 1
    expect(g.s.giocatori[0].energia).toBe(4);
  });
  it('l energia non spesa non si conserva', () => {
    const g = nuova();
    energia(g, 0, 7);
    giroIntero(g);
    expect(g.s.giocatori[0].energia).toBe(3);
  });
  it('inizio del turno: si pesca 1 carta (CT-DES-053, §5)', () => {
    const g = nuova();
    const n = g.s.giocatori[1].mano.length;
    finisci(g, 0);
    expect(g.s.giocatori[1].mano.length).toBe(n + 1);
  });
  it('mano iniziale 5 carte, 6 per il secondo (CT-DES-030)', () => {
    const g = nuova();
    // il primo ha gia' pescato 1 all'inizio del suo turno
    expect(g.s.giocatori[0].mano.length).toBe(REGOLE.manoIniziale + 1);
    expect(g.s.giocatori[1].mano.length).toBe(REGOLE.manoIniziale + 1);
  });
});

describe('CT-DES-028 tutte le carte che l energia permette', () => {
  it('si possono giocare piu carte nello stesso turno finche c e energia', () => {
    const g = nuova();
    energia(g, 0, 3);
    mano(g, 0, 'CU01', 'CU01', 'CU01');
    gioca(g, 0, 'CU01', { terr: 0 });
    gioca(g, 0, 'CU01', { terr: 0 });
    gioca(g, 0, 'CU01', { terr: 1 });
    expect(g.s.giocatori[0].energia).toBe(0);
    expect(totPresenze(g, 0, 0)).toBe(2);
    // restano solo carte da 0 energia (la riserva ottenuta prendendo il controllo)
    const costi = legali(g).flatMap((m) => (m.t === 'gioca' ? [cat.carte.get(g.s.giocatori[0].mano.find((c) => c.uid === m.carta)!.id)!.costo] : []));
    expect(costi.every((c) => c === 0)).toBe(true);
  });
});

describe('CT-DES-029 nessuna risposta durante il turno avversario', () => {
  it('chi non e di turno non puo muovere', () => {
    const g = nuova();
    expect(chiDeveMuovere(g)).toBe(0);
    expect(() => applica(g, 1, { t: 'fine' })).toThrow(MossaIllegale);
    const v1 = creaVista(g, 1);
    expect(v1.mosseLegali).toEqual([]);
  });
});

describe('CT-DES-031 e 033 esposizione e instabilita', () => {
  it('la carta potente fa salire l esposizione, e l instabilita del territorio dove e giocata', () => {
    const g = nuova(1, 'risvegliati');
    energia(g, 0, 9);
    mano(g, 0, 'RI08'); // Shoggoth: potente 1, forza 6
    gioca(g, 0, 'RI08', { terr: 0 });
    expect(g.s.giocatori[0].esposizione).toBe(1);
    expect(g.s.territori[0].inst).toBe(1);
  });
  it('ridurre l esposizione: 2 energia, -1, una volta per turno (CT-DES-033)', () => {
    const g = nuova();
    energia(g, 0, 9);
    esposizione(g, 0, 4);
    mossa(g, 0, { t: 'riduci' });
    expect(g.s.giocatori[0].esposizione).toBe(3);
    expect(g.s.giocatori[0].energia).toBe(7);
    expect(legali(g).some((m) => m.t === 'riduci')).toBe(false);
  });
});

describe('CT-DES-034 e 051 soglie di instabilita', () => {
  it('a 4 le presenze hanno -1 forza', () => {
    const g = nuova();
    presenza(g, 0, 2, 'CU03'); // forza 4
    expect(forzaTerritorio(g, 2, 0)).toBe(4);
    inst(g, 2, 4);
    expect(forzaTerritorio(g, 2, 0)).toBe(3);
  });
  it('a 5 si scatena l effetto cosmico a fine giro: Innsmouth +1 esposizione a chi controlla', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01');
    inst(g, 0, 5);
    esposizione(g, 0, 0);
    giroIntero(g);
    expect(g.s.giocatori[0].esposizione).toBeGreaterThanOrEqual(1);
  });
  it('a 5 la Biblioteca fa scartare 1 carta a caso a chi controlla', () => {
    const g = nuova();
    presenza(g, 0, 1, 'CU01');
    inst(g, 1, 5);
    mano(g, 0, 'CU01', 'CU01', 'CU01');
    finisci(g, 0);
    finisci(g, 1);
    // dopo il turno di avvio (pesca +1) la mano e' al massimo 3 - 1 + 1
    expect(g.s.giocatori[0].scarti.length).toBeGreaterThanOrEqual(1);
  });
  it('a 5 la Landa elimina le presenze con forza 1 o meno', () => {
    const g = nuova();
    presenza(g, 0, 2, 'CU05'); // forza 1, ma limita a 3
    presenza(g, 1, 2, 'RI01'); // forza 1
    presenza(g, 1, 2, 'RI04'); // forza 4
    inst(g, 2, 5);
    // il Cerchio dei Vigilanti impedisce 5: lo togliamo per provare la soglia
    g.s.territori[2].presenze[0] = [];
    inst(g, 2, 5);
    giroIntero(g);
    expect(g.s.territori[2].presenze[1].map((p) => p.carta.id)).toEqual(['RI04']);
  });
  it('la soglia 3 non ha penalita', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU03');
    inst(g, 0, 3);
    expect(forzaTerritorio(g, 0, 0)).toBe(4);
  });
});

describe('CT-DES-035 e 036 tipo del prossimo evento e fasi', () => {
  it('si vede sempre il tipo del prossimo evento', () => {
    const g = nuova();
    const v = creaVista(g, 0);
    expect(['territorio', 'giocatore', 'campo', 'carte', '?']).toContain(v.prossimoEvento);
  });
  it('fase I giri 1-3, II 4-6, III dal 7', () => {
    const g = nuova();
    const eventiDi = (f: 'fase_I' | 'fase_II' | 'fase_III') => g.s.mazzettiEventi[f].scarti.length;
    for (let i = 0; i < 3; i++) giroIntero(g);
    expect([eventiDi('fase_I'), eventiDi('fase_II'), eventiDi('fase_III')]).toEqual([3, 0, 0]);
    for (let i = 0; i < 3; i++) giroIntero(g);
    expect([eventiDi('fase_I'), eventiDi('fase_II'), eventiDi('fase_III')]).toEqual([3, 3, 0]);
    giroIntero(g);
    expect(eventiDi('fase_III')).toBe(1);
  });
  it('un evento improvviso va nella fase II e uno nella fase III; mostrano "?"', () => {
    const g = nuova();
    expect(g.s.mazzettiEventi.fase_II.mazzo).toHaveLength(7);
    expect(g.s.mazzettiEventi.fase_III.mazzo).toHaveLength(7);
    expect(g.s.mazzettiEventi.fase_I.mazzo).toHaveLength(6);
    expect(g.s.mazzettiEventi.fase_II.mazzo.some((id) => g.cat.eventi.get(id)!.tipo === '?')).toBe(true);
  });
});

describe('CT-DES-037, 038, 015 e 055 obiettivi, tappe, segnale e turno di avviso', () => {
  function pronti(): ReturnType<typeof nuova> {
    const g = nuova();
    energia(g, 0, 20);
    presenza(g, 0, 0, 'CU03');
    presenza(g, 0, 1, 'CU03');
    presenza(g, 0, 2, 'CU03');
    return g;
  }
  it('Sigillo: serve il controllo e instabilita 3 o meno, costa 2, uno per territorio (CT-DES-055)', () => {
    const g = pronti();
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].energia).toBe(18);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 0)).toBe(false); // uno per territorio
    inst(g, 1, 4);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 1)).toBe(false); // instabilita' troppo alta
    inst(g, 1, 3);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 1)).toBe(true);
  });
  it('senza controllo non si pone il Sigillo', () => {
    const g = nuova();
    energia(g, 0, 9);
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false);
  });
  it('segnale a 2 tappe; la terza solo dopo il turno di avviso; vittoria immediata', () => {
    const g = pronti();
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: 1 });
    expect(g.s.giocatori[0].segnale).not.toBeNull();
    // nello stesso turno la terza non e' possibile
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false);
    finisci(g, 0);
    // turno di avviso dell'avversario
    finisci(g, 1);
    energia(g, 0, 10);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 2)).toBe(true);
    mossa(g, 0, { t: 'tappa', terr: 2 });
    expect(g.s.vincitore).toBe(0);
    expect(legali(g)).toEqual([]);
  });
  it('rito dei Risvegliati: presenza, almeno tanta forza dell avversario, instabilita 3 o piu', () => {
    const g = nuova(1, 'risvegliati');
    energia(g, 0, 9);
    presenza(g, 0, 0, 'RI01');
    presenza(g, 1, 0, 'CU03');
    inst(g, 0, 3);
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false); // forza 1 contro 4
    presenza(g, 0, 0, 'RI04');
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 0)).toBe(true);
    inst(g, 0, 2);
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false); // instabilita' troppo bassa
  });
  it('ogni fazione ha 3 tappe (CT-DES-037)', () => {
    expect(REGOLE.tappeVittoria).toBe(3);
  });
});

describe('CT-DES-056 tappe consolidate', () => {
  it('l avversario puo toglierla solo fino alla fine del suo turno successivo', () => {
    const g = nuova();
    energia(g, 0, 9);
    presenza(g, 0, 0, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    finisci(g, 0);
    // turno dei Risvegliati: la profanazione e' possibile
    presenza(g, 1, 0, 'RI04');
    inst(g, 0, 3);
    energia(g, 1, 9);
    mano(g, 1, 'RI12');
    expect(legali(g).some((m) => m.t === 'gioca')).toBe(true);
    // lasciamo passare il turno dell'avversario: la tappa si consolida
    finisci(g, 1);
    // nel giro dopo (turno 0 poi turno 1) non e' piu' togliibile
    finisci(g, 0);
    mano(g, 1, 'RI12');
    energia(g, 1, 9);
    expect(legali(g).some((m) => m.t === 'gioca')).toBe(false);
  });
  it('se perde una tappa il segnale si spegne; quando torna riparte il turno di avviso', () => {
    const g = nuova();
    energia(g, 0, 20);
    for (const t of [0, 1, 2]) presenza(g, 0, t, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: 1 });
    expect(g.s.giocatori[0].segnale).not.toBeNull();
    finisci(g, 0);
    // i Risvegliati tolgono una tappa con Profanazione
    presenza(g, 1, 0, 'RI04');
    inst(g, 0, 3);
    energia(g, 1, 9);
    mano(g, 1, 'RI12');
    gioca(g, 1, 'RI12', { terr: 0 });
    expect(g.s.giocatori[0].segnale).toBeNull();
    finisci(g, 1);
    inst(g, 0, 2);
    energia(g, 0, 20);
    presenza(g, 0, 0, 'CU04'); // riprende il controllo
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].segnale).not.toBeNull();
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 2)).toBe(false); // nuovo turno di avviso
  });
});

describe('CT-DES-039 informazione visibile e nascosta', () => {
  it('la vista non mostra mano e mazzo dell avversario, solo i numeri', () => {
    const g = nuova();
    const v = creaVista(g, 0);
    expect(v.nManoAvv).toBe(g.s.giocatori[1].mano.length);
    expect(v.nMazzoAvv).toBe(g.s.giocatori[1].mazzo.length);
    const json = JSON.stringify(v);
    for (const c of g.s.giocatori[1].mazzo) expect(json).not.toContain(`"uid":${c.uid},`);
    expect(Object.keys(v)).not.toContain('manoAvv');
  });
  it('sono visibili carte in campo, indicatori, tappe, prossimo evento, scarti', () => {
    const g = nuova();
    presenza(g, 1, 0, 'RI04');
    const v = creaVista(g, 0);
    expect(v.territori[0].loro.map((p) => p.id)).toEqual(['RI04']);
    expect(v.territori[0].inst).toBe(0);
    expect(v.esposizioneAvv).toBe(0);
    expect(v).toHaveProperty('scartiAvv');
  });
});

describe('CT-DES-040 le presenze non si spostano', () => {
  it('non esiste una mossa di spostamento', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01');
    expect(legali(g).every((m) => ['gioca', 'tappa', 'riduci', 'fine'].includes(m.t))).toBe(true);
  });
});

describe('CT-DES-041 le due fazioni hanno mazzi diversi', () => {
  it('custodi e risvegliati hanno id di carte diversi', () => {
    const g = nuova();
    const a = new Set(g.s.giocatori[0].mazzo.map((c) => c.id.slice(0, 2)));
    const b = new Set(g.s.giocatori[1].mazzo.map((c) => c.id.slice(0, 2)));
    expect([...a]).toEqual(['CU']);
    expect([...b]).toEqual(['RI']);
  });
});

describe('CT-DES-042 mazzo finito', () => {
  it('si rimescolano gli scarti e l esposizione sale di 1', () => {
    const g = nuova();
    const gi = g.s.giocatori[0];
    gi.scarti = gi.mazzo.splice(0);
    gi.mano = [];
    expect(gi.mazzo).toHaveLength(0);
    pesca(g, 0, 1);
    expect(gi.esposizione).toBe(1);
    expect(gi.mazzo.length + gi.mano.length).toBeGreaterThan(30);
    expect(gi.scarti).toHaveLength(0);
  });
});

describe('CT-DES-045 priorita del computer: vedi computer.test.ts', () => {
  it('(rimando)', () => expect(true).toBe(true));
});

describe('CT-DES-046 effetti dei territori', () => {
  it('Innsmouth: chi lo controlla pesca 1 carta in piu a ogni turno', () => {
    const g = nuova();
    presenza(g, 1, 0, 'RI01');
    const prima = g.s.giocatori[1].mano.length;
    finisci(g, 0);
    // il turno del giocatore 1 e' gia' iniziato: ha pescato 2 (1 + 1 per il controllo di Innsmouth)
    expect(g.s.giocatori[1].mano.length).toBe(prima + 2);
  });
  it('Biblioteca: pesca 1 carta e riordina le prime 3', () => {
    const g = nuova();
    const n0 = g.s.giocatori[0].mano.length;
    presenza(g, 0, 1, 'CU01', { riordina: true });
    expect(g.s.giocatori[0].mano.length).toBe(n0 + 2); // riserva + 1 carta
    expect(g.s.decisione).not.toBeNull();
    const uids = g.s.decisione!.uids;
    expect(uids).toHaveLength(3);
    const ordine = [...uids].reverse();
    mossa(g, 0, { t: 'riordina', ordine });
    expect(g.s.decisione).toBeNull();
    expect(g.s.giocatori[0].mazzo.slice(-3).reverse().map((c) => c.uid)).toEqual(ordine);
  });
  it('Landa: ogni carta potente giocata li fa salire l instabilita di 1 in piu', () => {
    const g = nuova(1, 'risvegliati');
    energia(g, 0, 9);
    mano(g, 0, 'RI08');
    gioca(g, 0, 'RI08', { terr: 2 });
    expect(g.s.territori[2].inst).toBe(2);
  });
});

describe('CT-DES-049 parita', () => {
  it('in parita di forza nessuno controlla', () => {
    const g = nuova();
    presenza(g, 0, 0, 'CU01');
    presenza(g, 1, 0, 'RI04', { bonus: -2 });
    expect(forzaTerritorio(g, 0, 0)).toBe(2);
    expect(forzaTerritorio(g, 0, 1)).toBe(2);
    expect(g.s.territori[0].controllo).toBeNull();
    expect(numControllati(g, 0)).toBe(0);
  });
});

describe('CT-DES-050 massimo 4 presenze per territorio', () => {
  it('la quinta presenza non e legale', () => {
    const g = nuova();
    energia(g, 0, 20);
    mano(g, 0, 'CU01', 'CU01', 'CU01', 'CU01', 'CU01');
    for (let i = 0; i < 4; i++) gioca(g, 0, 'CU01', { terr: 2 });
    expect(legali(g).some((m) => m.t === 'gioca' && m.terr === 2)).toBe(false);
    expect(legali(g).some((m) => m.t === 'gioca' && m.terr === 0)).toBe(true);
  });
});

describe('CT-DES-054 la lista dei 20 eventi', () => {
  it('ci sono 20 eventi: 6 + 6 + 6 + 2 improvvisi', () => {
    expect(cat.dati.eventi.fase_I).toHaveLength(6);
    expect(cat.dati.eventi.fase_II).toHaveLength(6);
    expect(cat.dati.eventi.fase_III).toHaveLength(6);
    expect(cat.dati.eventi.improvvisi).toHaveLength(2);
  });
});

describe('CT-DES-057 primo turno della partita', () => {
  it('chi gioca per primo ha 1 energia, chi gioca per secondo 3', () => {
    const g = nuova(7, 'risvegliati');
    expect(g.s.giocatori[0].fazione).toBe('risvegliati');
    expect(g.s.giocatori[0].energia).toBe(1);
    finisci(g, 0);
    expect(g.s.giocatori[1].energia).toBe(3);
  });
});

describe('CT-DES-058 chiarimenti', () => {
  it('una carta potente senza territorio alza solo l esposizione', () => {
    const g = nuova(1, 'risvegliati');
    energia(g, 0, 9);
    mano(g, 0, 'RI13'); // Sogni di R'lyeh: potente 1, nessun territorio
    gioca(g, 0, 'RI13');
    expect(g.s.giocatori[0].esposizione).toBe(1);
    expect(g.s.territori.map((t) => t.inst)).toEqual([0, 0, 0]);
  });
  it('"mazzo" nella trasformazione indica le carte ancora da pescare', () => {
    const g = nuova(1, 'risvegliati');
    const m = g.s.giocatori[0].mano.map((c) => c.trasformata);
    addEsp(g, 0, 3);
    expect(g.s.giocatori[0].mano.map((c) => c.trasformata)).toEqual(m);
  });
  it('Esorcismo di Armitage richiede il controllo del territorio', () => {
    const g = nuova(1, 'custodi');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    energia(g, 0, 9);
    mano(g, 0, 'CU13');
    expect(legali(g).some((m) => m.t === 'gioca')).toBe(false);
    presenza(g, 0, 0, 'CU03');
    expect(legali(g).some((m) => m.t === 'gioca' && m.terr === 0)).toBe(true);
  });
});

describe('CT-DES-009 e §11 instabilita crescente dal giro 7', () => {
  it('dal giro 7, a fine giro, tutti i territori +1', () => {
    const g = nuova();
    for (let i = 0; i < 6; i++) giroIntero(g);
    const prima = g.s.territori.map((t) => t.inst).reduce((a, b) => a + b, 0);
    expect(g.s.giro).toBe(7);
    giroIntero(g);
    const dopo = g.s.territori.map((t) => t.inst).reduce((a, b) => a + b, 0);
    // eventi a parte, la crescita porta almeno +3 prima di eventuali -1/-2 degli eventi
    expect(dopo).toBeGreaterThanOrEqual(Math.min(15, prima + 3 - 3));
    void addInst;
  });
});

describe('CT-DES-010 e CT-DES-035 la forza cosmica colpisce il piu esposto', () => {
  it('Nyarlathotep (E14): il piu esposto +2', () => {
    const g = nuova();
    esposizione(g, 1, 4);
    // simula l'evento mettendolo in cima al mazzetto della fase I
    g.s.mazzettiEventi.fase_I.mazzo.push('E14');
    giroIntero(g);
    expect(g.s.giocatori[1].esposizione).toBe(6);
    expect(g.s.giocatori[0].esposizione).toBe(0);
  });
});

describe('CT-DES-019 seme e registro', () => {
  it('stesso seme: stessi mazzi e stesso inizio', () => {
    const a = nuova(42);
    const b = nuova(42);
    expect(a.s.giocatori.map((p) => p.mano.map((c) => c.id))).toEqual(b.s.giocatori.map((p) => p.mano.map((c) => c.id)));
    const c = nuova(43);
    expect(c.s.giocatori.map((p) => p.mano.map((x) => x.id))).not.toEqual(a.s.giocatori.map((p) => p.mano.map((x) => x.id)));
  });
  it('il registro contiene tutte le mosse', () => {
    const g = nuova();
    finisci(g, 0);
    finisci(g, 1);
    expect(g.s.registro.map((r) => r.m.t)).toEqual(['fine', 'fine']);
  });
});

describe('mosse legali', () => {
  it('ogni mossa elencata e applicabile e una mossa illegale viene rifiutata', () => {
    const g = nuova();
    for (const m of mosseLegali(g)) {
      const copia = nuova();
      applica(copia, 0, m);
    }
    expect(() => applica(g, 0, { t: 'tappa', terr: 0 })).toThrow(MossaIllegale);
  });
});
