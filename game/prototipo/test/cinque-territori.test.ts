// Le regole nuove dei 5 territori (Core Rules V0.13, CT-DES-069...074): tappe con R'lyeh, Pietre ritte di Dunwich,
// effetti di R'lyeh e Dunwich, effetti cosmici a instabilita' 5.
import { describe, expect, it } from 'vitest';
import { effettiCosmiciTerritori } from '../src/motore/eventi.js';
import { MossaIllegale, applica } from '../src/motore/motore.js';
import { tappaPosabile } from '../src/motore/queries.js';
import { REGOLE, TERR } from '../src/motore/regole.js';
import { cat, energia, esposizione, finisci, gioca, inst, legali, mano, mossa, nuova, partita, presenza } from './aiuti.js';

const C = 'custodi' as const;
const R = 'risvegliati' as const;
const DUNWICH = 3;
const RLYEH = 4;

const tappe = (g: ReturnType<typeof nuova>) => legali(g).filter((m) => m.t === 'tappa').map((m) => (m.t === 'tappa' ? m.terr : -1));
const pietre = (g: ReturnType<typeof nuova>) => legali(g).filter((m) => m.t === 'pietre');

describe('CT-DES-069 gli effetti dei territori seguono l id, non la posizione', () => {
  it('Dunwich e R lyeh sono T4 e T5 nei dati e nelle regole', () => {
    expect(cat.dati.territori[DUNWICH].id).toBe(TERR.dunwich);
    expect(cat.dati.territori[RLYEH].id).toBe(TERR.rlyeh);
  });
});

describe('CT-DES-070 la terza tappa solo a R lyeh', () => {
  it('Custodi: i Sigilli esterni sono possibili con meno di 2 tappe, anche a Dunwich', () => {
    const g = partita(C);
    for (const t of [0, DUNWICH]) presenza(g, 0, t, 'CU03');
    expect(tappe(g)).toEqual([0, DUNWICH]);
  });
  it('Custodi: a R lyeh nessuna tappa con 0 o 1 tappe, anche con controllo e instabilita bassa', () => {
    const g = partita(C);
    presenza(g, 0, RLYEH, 'CU03');
    expect(tappe(g)).toEqual([]);
    presenza(g, 0, 0, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].tappe).toHaveProperty('0');
    expect(tappaPosabile(g, 0, RLYEH)).toBe(false);
  });
  it('Custodi: con 2 tappe solo R lyeh, e solo dopo il turno di avviso', () => {
    const g = partita(C);
    for (const t of [0, 1, 2, DUNWICH, RLYEH]) presenza(g, 0, t, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: 1 });
    expect(g.s.giocatori[0].segnale).not.toBeNull();
    expect(tappe(g)).toEqual([]); // stesso turno del segnale
    finisci(g, 0);
    finisci(g, 1);
    energia(g, 0, 10);
    expect(tappe(g)).toEqual([RLYEH]); // ne' T3 ne' Dunwich, anche se controllati
    mossa(g, 0, { t: 'tappa', terr: RLYEH });
    expect(g.s.vincitore).toBe(0);
  });
  it('Risvegliati: stessa regola per i riti', () => {
    const g = partita(R);
    for (const t of [0, 1, 2, DUNWICH, RLYEH]) {
      presenza(g, 0, t, 'RI04');
      inst(g, t, 3);
    }
    // con meno di 2 tappe R'lyeh e' vietata, gli esterni no
    expect(tappe(g)).toEqual([0, 1, 2, DUNWICH]);
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: DUNWICH });
    finisci(g, 0);
    finisci(g, 1);
    energia(g, 0, 10);
    for (const t of [1, 2, RLYEH]) inst(g, t, 3);
    expect(tappe(g)).toEqual([RLYEH]);
  });
  it('se perdi una tappa non puoi fare R lyeh finche non torni a due', () => {
    const g = partita(C);
    for (const t of [0, 1, 2, RLYEH]) presenza(g, 0, t, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: 1 });
    finisci(g, 0);
    // i Risvegliati tolgono un Sigillo con la Profanazione
    presenza(g, 1, 0, 'RI04');
    inst(g, 0, 3);
    energia(g, 1, 9);
    mano(g, 1, 'RI12');
    gioca(g, 1, 'RI12', { terr: 0 });
    expect(g.s.giocatori[0].segnale).toBeNull();
    finisci(g, 1);
    energia(g, 0, 20);
    inst(g, RLYEH, 0);
    expect(tappaPosabile(g, 0, RLYEH)).toBe(false); // una sola tappa
    // torna a 2 con un Sigillo esterno: R'lyeh resta chiusa fino alla fine del turno di avviso
    inst(g, 2, 0);
    mossa(g, 0, { t: 'tappa', terr: 2 });
    expect(g.s.giocatori[0].segnale).not.toBeNull();
    expect(tappaPosabile(g, 0, RLYEH)).toBe(false); // turno di avviso
    finisci(g, 0);
    finisci(g, 1);
    energia(g, 0, 20);
    expect(tappaPosabile(g, 0, RLYEH)).toBe(true);
  });
  it('un Sigillo posto gratis dalla Pietra Stellata segue le stesse regole', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    presenza(g, 0, 1, 'CU03');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    mossa(g, 0, { t: 'tappa', terr: 1 });
    mano(g, 0, 'CU09');
    // con 2 tappe la Pietra Stellata non puo' porre il Sigillo su un territorio esterno
    gioca(g, 0, 'CU09', { terr: DUNWICH });
    expect(g.s.giocatori[0].tappe).not.toHaveProperty(String(DUNWICH));
    expect(Object.keys(g.s.giocatori[0].tappe)).toHaveLength(2);
  });
});

describe('CT-DES-071 e CT-DES-073 Dunwich: le Pietre ritte', () => {
  it('serve controllare Dunwich: senza controllo (o in parita) nessuna mossa', () => {
    const g = partita(C);
    expect(pietre(g)).toEqual([]);
    presenza(g, 1, DUNWICH, 'RI04');
    expect(pietre(g)).toEqual([]); // le controlla l'avversario
    presenza(g, 0, DUNWICH, 'CU04'); // forza 6 contro 4
    expect(pietre(g).length).toBeGreaterThan(0);
  });
  it('costa 1 energia, alza o abbassa di 1 un altro territorio e non fa salire l esposizione', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    inst(g, 1, 2);
    const e = g.s.giocatori[0].energia;
    mossa(g, 0, { t: 'pietre', terr: 1, segno: 1 });
    expect(g.s.territori[1].inst).toBe(3);
    expect(g.s.giocatori[0].energia).toBe(e - REGOLE.costoPietreRitte);
    expect(g.s.giocatori[0].esposizione).toBe(0);
    expect(g.s.giocatori[1].esposizione).toBe(0);
  });
  it('si puo anche abbassare', () => {
    const g = partita(R);
    presenza(g, 0, DUNWICH, 'RI01');
    inst(g, 1, 2);
    mossa(g, 0, { t: 'pietre', terr: 1, segno: -1 });
    expect(g.s.territori[1].inst).toBe(1);
  });
  it('una volta per turno; il turno dopo si riusa', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    mossa(g, 0, { t: 'pietre', terr: 1, segno: 1 });
    expect(pietre(g)).toEqual([]);
    expect(() => mossa(g, 0, { t: 'pietre', terr: 1, segno: 1 })).toThrow(MossaIllegale);
    finisci(g, 0);
    finisci(g, 1);
    expect(g.s.giocatori[0].pietreUsateInTurno).toBe(false);
    energia(g, 0, 5);
    expect(pietre(g).length).toBeGreaterThan(0);
  });
  it('solo un altro territorio: mai Dunwich stessa', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    inst(g, DUNWICH, 2);
    const bersagli = new Set(pietre(g).map((m) => (m.t === 'pietre' ? m.terr : -1)));
    expect(bersagli.has(DUNWICH)).toBe(false);
    expect([...bersagli].sort()).toEqual([0, 1, 2, RLYEH]);
    expect(() => mossa(g, 0, { t: 'pietre', terr: DUNWICH, segno: 1 })).toThrow(MossaIllegale);
  });
  it('serve almeno 1 energia', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    energia(g, 0, 0);
    expect(pietre(g)).toEqual([]);
  });
  it('non offre cambi che non modificano nulla (sotto 0 o sopra 5)', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    inst(g, 0, 0);
    inst(g, 1, 5);
    const p = pietre(g);
    expect(p.some((m) => m.t === 'pietre' && m.terr === 0 && m.segno === -1)).toBe(false);
    expect(p.some((m) => m.t === 'pietre' && m.terr === 1 && m.segno === 1)).toBe(false);
    expect(p.some((m) => m.t === 'pietre' && m.terr === 0 && m.segno === 1)).toBe(true);
  });
  it('vale per chi controlla Dunwich al momento della mossa: perso il controllo, non piu', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    expect(pietre(g).length).toBeGreaterThan(0);
    presenza(g, 1, DUNWICH, 'RI04'); // l'avversario prende il controllo a meta' turno
    expect(pietre(g)).toEqual([]);
  });
  it('e registrata nel registro delle mosse e si puo rigiocare', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    applica(g, 0, { t: 'pietre', terr: 2, segno: 1 });
    expect(g.s.registro.at(-1)!.m).toEqual({ t: 'pietre', terr: 2, segno: 1 });
  });
});

describe('CT-DES-073 R lyeh, La citta dormiente', () => {
  it('una carta potente giocata a R lyeh fa salire l esposizione di 1 in piu', () => {
    const g = partita(R);
    mano(g, 0, 'RI08'); // Shoggoth: potente 1
    gioca(g, 0, 'RI08', { terr: RLYEH });
    expect(g.s.giocatori[0].esposizione).toBe(2);
    expect(g.s.territori[RLYEH].inst).toBe(1);
  });
  it('altrove la stessa carta alza di 1 soltanto', () => {
    const g = partita(R);
    mano(g, 0, 'RI08');
    gioca(g, 0, 'RI08', { terr: 0 });
    expect(g.s.giocatori[0].esposizione).toBe(1);
    expect(g.s.territori[0].inst).toBe(1);
  });
  it('sale l esposizione di chi la gioca, non dell avversario', () => {
    const g = partita(R);
    mano(g, 0, 'RI08');
    gioca(g, 0, 'RI08', { terr: RLYEH });
    expect(g.s.giocatori[1].esposizione).toBe(0);
  });
  it('un azione potente che bersaglia una presenza a R lyeh conta come giocata li (chiarimento 9)', () => {
    const g = partita(R);
    const p = presenza(g, 0, RLYEH, 'RI01');
    mano(g, 0, 'RI16'); // Benedizione di Yog-Sothoth: potente 1
    gioca(g, 0, 'RI16', { pres: p.uid });
    expect(g.s.giocatori[0].esposizione).toBe(2);
  });
  it('una carta non potente a R lyeh non cambia l esposizione', () => {
    const g = partita(R);
    mano(g, 0, 'RI04');
    gioca(g, 0, 'RI04', { terr: RLYEH });
    expect(g.s.giocatori[0].esposizione).toBe(0);
  });
  it('la Landa Maledetta continua a dare +1 di instabilita in piu', () => {
    const g = partita(R);
    mano(g, 0, 'RI08');
    gioca(g, 0, 'RI08', { terr: 2 });
    expect(g.s.territori[2].inst).toBe(2);
  });
});

describe('CT-DES-073 effetti cosmici a instabilita 5 di R lyeh e Dunwich', () => {
  it('Cthulhu si agita: R lyeh a 5, +1 esposizione a entrambi i giocatori', () => {
    const g = nuova();
    inst(g, RLYEH, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.giocatori.map((p) => p.esposizione)).toEqual([1, 1]);
    effettiCosmiciTerritori(g); // ogni fine giro finche resta a 5
    expect(g.s.giocatori.map((p) => p.esposizione)).toEqual([2, 2]);
  });
  it('Cthulhu si agita non scatta a instabilita 4', () => {
    const g = nuova();
    inst(g, RLYEH, 4);
    effettiCosmiciTerritori(g);
    expect(g.s.giocatori.map((p) => p.esposizione)).toEqual([0, 0]);
  });
  it('Cthulhu si agita scatta anche senza che nessuno controlli R lyeh', () => {
    const g = nuova();
    expect(g.s.territori[RLYEH].controllo).toBeNull();
    inst(g, RLYEH, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('L Orrore di Dunwich: elimina la presenza con forza piu alta, di entrambi i giocatori', () => {
    const g = nuova();
    presenza(g, 0, DUNWICH, 'CU01'); // 2 (1 a instabilita' 5)
    presenza(g, 1, DUNWICH, 'RI04'); // 4 (3 a instabilita' 5)
    inst(g, DUNWICH, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.territori[DUNWICH].presenze[1]).toHaveLength(0);
    expect(g.s.territori[DUNWICH].presenze[0]).toHaveLength(1);
  });
  it('L Orrore di Dunwich: a parita elimina tutte le presenze con quella forza', () => {
    const g = nuova();
    // a instabilita' 5 tutte le presenze hanno -1 forza: CU03 3, RI04 3, CU01 1, RI01 0
    presenza(g, 0, DUNWICH, 'CU03');
    presenza(g, 0, DUNWICH, 'CU01');
    presenza(g, 1, DUNWICH, 'RI04');
    presenza(g, 1, DUNWICH, 'RI01');
    inst(g, DUNWICH, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.territori[DUNWICH].presenze[0].map((p) => p.carta.id)).toEqual(['CU01']);
    expect(g.s.territori[DUNWICH].presenze[1].map((p) => p.carta.id)).toEqual(['RI01']);
  });
  it('L Orrore di Dunwich: senza presenze non succede nulla; non agisce a instabilita 4', () => {
    const g = nuova();
    inst(g, DUNWICH, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.territori[DUNWICH].presenze).toEqual([[], []]);
    const h = nuova();
    presenza(h, 0, DUNWICH, 'CU01');
    inst(h, DUNWICH, 4);
    effettiCosmiciTerritori(h);
    expect(h.s.territori[DUNWICH].presenze[0]).toHaveLength(1);
  });
  it('gli effetti cosmici dei primi 3 territori restano quelli di prima (agganciati all id)', () => {
    const g = nuova();
    presenza(g, 1, 0, 'RI04');
    inst(g, 0, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.giocatori[1].esposizione).toBe(1); // Innsmouth: chi controlla +1 esposizione
    presenza(g, 0, 2, 'CU01'); // forza 2, -1 a instabilita' 4+
    inst(g, 2, 5);
    effettiCosmiciTerritori(g);
    expect(g.s.territori[2].presenze[0]).toHaveLength(0); // Landa: via le presenze con forza 1 o meno
  });
});

describe('le nuove mosse e il registro', () => {
  it('ogni mossa elencata e applicabile, comprese le Pietre ritte', () => {
    const g = partita(C);
    presenza(g, 0, DUNWICH, 'CU01');
    for (const m of legali(g)) {
      const copia = partita(C);
      presenza(copia, 0, DUNWICH, 'CU01');
      applica(copia, 0, m);
    }
  });
  it('R lyeh e il quinto indice, Dunwich il quarto: la vista li elenca nell ordine dei dati', () => {
    const g = nuova();
    expect(g.s.territori).toHaveLength(5);
    expect(g.cat.dati.territori[DUNWICH].nome).toBe('Dunwich');
    expect(g.cat.dati.territori[RLYEH].nome).toBe("R'lyeh");
    void esposizione;
  });
});
