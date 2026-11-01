// Il computer: mai mosse illegali, solo informazioni visibili, priorita' di fazione (Core Rules §10, CT-DES-045).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sceglieMossa } from '../src/computer/computer.js';
import { applica, chiDeveMuovere, chiaveMossa, creaPartita, finita } from '../src/motore/motore.js';
import { creaVista } from '../src/motore/vista.js';
import { cat, energia, esposizione, inst, mano, nuova, partita, presenza } from './aiuti.js';

const DUNWICH = 3;
const RLYEH = 4;

const idCarta =(v: ReturnType<typeof creaVista>, m: ReturnType<typeof sceglieMossa>) =>
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
    expect(mosse).toBeGreaterThan(5000); // con 5 territori le partite sono piu' brevi (la soglia era 10000 con 3)
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
  it('fuori tabella: se l avversario e a un passo e non ha di meglio usa l Esorcismo di Armitage', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    g.s.giocatori[0].tappe[0] = g.s.turniCompletati - 5; // niente Sigillo da porre qui
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    mano(g, 0, 'CU13');
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('CU13');
  });
  it("1: se l avversario ha 2 tappe abbassa l instabilita di R'lyeh, dove sta per completare il rito", () => {
    const g = partita('custodi');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    presenza(g, 1, RLYEH, 'RI04');
    inst(g, RLYEH, 4);
    mano(g, 0, 'CU10', 'CU01');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('CU10');
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
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
  it("1: se i Custodi hanno 2 tappe alza l instabilita di R'lyeh, dove stanno per porre il Sigillo", () => {
    const g = partita('risvegliati');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    inst(g, RLYEH, 1);
    presenza(g, 1, RLYEH, 'CU03');
    mano(g, 0, 'RI10', 'RI01');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('RI10');
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
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

describe('priorita CT-DES-065 (tabella aggiornata)', () => {
  it('Custodi 1: a un passo dalla sconfitta gioca presenze dove l avversario puo completare l ultima tappa, per superarne la forza', () => {
    const g = partita('custodi');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    presenza(g, 1, RLYEH, 'RI04');
    presenza(g, 0, RLYEH, 'CU01');
    mano(g, 0, 'CU01', 'CU04');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
    expect(idCarta(v, m)).toBe('CU04'); // la presenza piu' forte
  });
  it('Risvegliati 3 (CT-DES-067): contende dove l instabilita e almeno 2, anche senza una propria presenza', () => {
    const g = partita('risvegliati');
    presenza(g, 1, 1, 'CU03'); // 4 contro 0
    inst(g, 1, 2);
    mano(g, 0, 'RI01', 'RI04');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(m.t === 'gioca' && m.terr).toBe(1);
    expect(idCarta(v, m)).toBe('RI04'); // la presenza piu' forte
  });
  it('Risvegliati 3: dove ha gia una presenza contende anche con instabilita bassa', () => {
    const g = partita('risvegliati');
    presenza(g, 0, 2, 'RI09'); // forza 0 (conta come presenza)
    presenza(g, 1, 2, 'CU03'); // 4 contro 0, instabilita' 0
    presenza(g, 1, 0, 'CU03'); // altro territorio svantaggioso ma senza presenza propria e instabilita' 0
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(2);
  });
  it('Risvegliati 3: tra piu territori sceglie quello con l instabilita piu alta', () => {
    const g = partita('risvegliati');
    presenza(g, 1, 0, 'CU03');
    presenza(g, 1, 1, 'CU03');
    presenza(g, 1, 2, 'CU03');
    inst(g, 0, 2);
    inst(g, 1, 3);
    inst(g, 2, 2);
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(1);
  });
  it('Risvegliati 3: non gioca dove ha gia il suo rito, ne dove ha gia la forza maggiore', () => {
    const g = partita('risvegliati');
    presenza(g, 0, 1, 'RI08'); // 6 contro 0: forza maggiore
    presenza(g, 1, 2, 'CU03');
    g.s.giocatori[0].tappe[2] = 0; // rito gia' fatto alla Landa
    presenza(g, 1, 0, 'CU03');
    inst(g, 0, 2);
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(0);
  });
  it('Risvegliati 1: a un passo dalla sconfitta alza l instabilita sopra 3 dove i Custodi possono porre l ultimo Sigillo', () => {
    const g = partita('risvegliati');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 5;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati - 5;
    presenza(g, 1, RLYEH, 'CU03');
    inst(g, RLYEH, 3);
    mano(g, 0, 'RI10', 'RI04');
    const v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('RI10');
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
  });
});

// Tabella CT-DES-074 (cinque territori). Territori: 0 Innsmouth, 1 Biblioteca, 2 Landa, 3 Dunwich, 4 R'lyeh.
const dueTappe = (g: ReturnType<typeof nuova>, pi: number) => {
  g.s.giocatori[pi].tappe[0] = g.s.turniCompletati - 5;
  g.s.giocatori[pi].tappe[1] = g.s.turniCompletati - 5;
};
const unaTappa = (g: ReturnType<typeof nuova>, pi: number) => {
  g.s.giocatori[pi].tappe[0] = g.s.turniCompletati - 5;
};

describe('CT-DES-074: priorita del computer a 5 territori', () => {
  it('il codice del computer non scrive id ne indici dei territori', () => {
    const src = readFileSync(new URL('../src/computer/computer.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/['"]T[1-5]['"]/);
    expect(src).not.toMatch(/TERR\.|idTerr|indiceTerr/);
  });
  it("Custodi 3: con 0 tappe non mette presenze a R'lyeh", () => {
    const g = partita('custodi');
    presenza(g, 1, RLYEH, 'RI04');
    mano(g, 0, 'CU01');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).not.toBe(RLYEH);
  });
  it("Custodi 3: con 1 tappa comincia anche a mettere presenze a R'lyeh (dove e' piu' conteso)", () => {
    const g = partita('custodi');
    unaTappa(g, 0);
    for (const t of [0, 1, 2, 3]) presenza(g, 0, t, 'CU03'); // esterni 4 contro 0
    presenza(g, 0, RLYEH, 'CU01');
    presenza(g, 1, RLYEH, 'RI04'); // R'lyeh 2 contro 4: differenza 2, il piu' conteso (gli esterni 4 contro 0)
    mano(g, 0, 'CU01');
    energia(g, 0, 1); // niente energia per un altro Sigillo
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
  });
  it("Custodi 3: con 2 tappe prepara R'lyeh con presenze fino a controllarlo", () => {
    const g = partita('custodi');
    dueTappe(g, 0);
    presenza(g, 1, RLYEH, 'RI04');
    presenza(g, 1, 0, 'RI04'); // un esterno piu' conteso non interessa piu'
    mano(g, 0, 'CU01');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
  });
  it("Risvegliati 3: con 0 tappe contende solo gli esterni, non R'lyeh", () => {
    const g = partita('risvegliati');
    presenza(g, 1, RLYEH, 'CU03');
    inst(g, RLYEH, 4);
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).not.toBe(RLYEH);
  });
  it("Risvegliati 3: con 1 tappa contende anche R'lyeh", () => {
    const g = partita('risvegliati');
    unaTappa(g, 0);
    presenza(g, 1, RLYEH, 'CU03');
    inst(g, RLYEH, 4);
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
  });
  it("Risvegliati 3: con 2 tappe mette presenze a R'lyeh, anche senza avversari", () => {
    const g = partita('risvegliati');
    dueTappe(g, 0);
    presenza(g, 1, 0, 'CU03');
    inst(g, 0, 3);
    mano(g, 0, 'RI04');
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m.t === 'gioca' && m.terr).toBe(RLYEH);
  });
  it('Custodi 1: con Pietre ritte abbassa R lyeh prima di tutto il resto', () => {
    const g = partita('custodi');
    dueTappe(g, 1);
    presenza(g, 0, DUNWICH, 'CU03'); // controlla Dunwich
    inst(g, DUNWICH, 4); // niente Sigillo li'
    presenza(g, 1, RLYEH, 'RI04');
    inst(g, RLYEH, 4);
    mano(g, 0, 'CU01');
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'pietre', terr: RLYEH, segno: -1 });
  });
  it('Risvegliati 5: con Pietre ritte tiene R lyeh a 3 o piu', () => {
    const g = partita('risvegliati');
    presenza(g, 0, DUNWICH, 'RI04');
    inst(g, RLYEH, 2);
    mano(g, 0);
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'pietre', terr: RLYEH, segno: 1 });
  });
  it('Risvegliati 5: con R lyeh a 3 alza dove ha presenze; a parita il territorio con indice piu basso', () => {
    const g = partita('risvegliati');
    presenza(g, 0, DUNWICH, 'RI04');
    for (const t of [2, 0]) presenza(g, 0, t, 'RI04');
    inst(g, RLYEH, 3);
    mano(g, 0);
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'pietre', terr: 0, segno: 1 });
  });
  it('Custodi 5: con Pietre ritte tiene R lyeh a 3 o meno anche prima dell ultima tappa', () => {
    const g = partita('custodi');
    presenza(g, 0, DUNWICH, 'CU03');
    inst(g, DUNWICH, 4);
    inst(g, RLYEH, 4);
    mano(g, 0);
    expect(sceglieMossa(creaVista(g, 0), cat)).toEqual({ t: 'pietre', terr: RLYEH, segno: -1 });
  });
  it('Pietra Incisa: i Custodi scelgono -1 su R lyeh, i Risvegliati +1', () => {
    const c = partita('custodi');
    dueTappe(c, 1);
    presenza(c, 1, RLYEH, 'RI04');
    inst(c, RLYEH, 4);
    mano(c, 0, 'T4r');
    const vc = creaVista(c, 0);
    const mc = sceglieMossa(vc, cat);
    expect(idCarta(vc, mc)).toBe('T4r');
    expect(mc.t === 'gioca' && [mc.terr, mc.segno]).toEqual([RLYEH, -1]);
    const r = partita('risvegliati');
    dueTappe(r, 1);
    presenza(r, 1, RLYEH, 'CU03');
    inst(r, RLYEH, 2);
    mano(r, 0, 'T4r');
    const vr = creaVista(r, 0);
    const mr = sceglieMossa(vr, cat);
    expect(idCarta(vr, mr)).toBe('T4r');
    expect(mr.t === 'gioca' && [mr.terr, mr.segno]).toEqual([RLYEH, 1]);
  });
  it("Idolo di Cthulhu: solo con una presenza a R'lyeh e controllo contestato", () => {
    const g = partita('custodi');
    presenza(g, 0, RLYEH, 'CU01');
    mano(g, 0, 'T5r');
    let v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).not.toBe('T5r'); // nessun avversario a R'lyeh
    presenza(g, 1, RLYEH, 'RI04'); // 2 contro 3: contestato
    v = creaVista(g, 0);
    const m = sceglieMossa(v, cat);
    expect(idCarta(v, m)).toBe('T5r');
    expect(m.t === 'gioca' && m.pres).toBe(g.s.territori[RLYEH].presenze[0][0].uid);
  });
});

describe('Formula di Dho-Hna e Studio del Necronomicon (CT-DES-068)', () => {
  it("Risvegliati: gioca la Formula se permette un rito altrimenti impossibile e ha l'energia per carta + rito", () => {
    const g = partita('risvegliati');
    presenza(g, 0, 0, 'RI04');
    inst(g, 0, 2);
    mano(g, 0, 'RI15');
    energia(g, 0, 3);
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('RI15');
    // poi completa il rito
    applica(g, 0, sceglieMossa(v, cat));
    const m = sceglieMossa(creaVista(g, 0), cat);
    expect(m).toEqual({ t: 'tappa', terr: 0 });
  });
  it("Custodi: gioca lo Studio se permette un Sigillo altrimenti impossibile e ha l'energia per carta + Sigillo", () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    inst(g, 0, 4);
    mano(g, 0, 'CU14');
    energia(g, 0, 3);
    const v = creaVista(g, 0);
    expect(idCarta(v, sceglieMossa(v, cat))).toBe('CU14');
  });
  it("non le gioca se manca l'energia per carta + tappa, se la tappa e' gia' possibile o se non serve a nessuna tappa", () => {
    for (const [fazione, id, instab] of [['risvegliati', 'RI15', 2], ['custodi', 'CU14', 4]] as const) {
      const g = partita(fazione);
      presenza(g, 0, 0, fazione === 'custodi' ? 'CU03' : 'RI04');
      inst(g, 0, instab);
      mano(g, 0, id);
      energia(g, 0, 2); // carta 1 + tappa 2 = 3
      let v = creaVista(g, 0);
      expect(idCarta(v, sceglieMossa(v, cat))).not.toBe(id);
      energia(g, 0, 3);
      inst(g, 0, 3); // tappa gia' possibile: la sceglie, senza carta
      v = creaVista(g, 0);
      expect(sceglieMossa(v, cat)).toEqual({ t: 'tappa', terr: 0 });
      inst(g, 0, fazione === 'custodi' ? 5 : 1); // fuori anche dalla soglia spostata
      v = creaVista(g, 0);
      expect(idCarta(v, sceglieMossa(v, cat))).not.toBe(id);
    }
  });
});

describe('il computer e deterministico', () => {
  it("stessa vista, stessa mossa", () => {
    const g = nuova(5);
    const v = creaVista(g, 0);
    expect(sceglieMossa(v, cat)).toEqual(sceglieMossa(v, cat));
  });
});
