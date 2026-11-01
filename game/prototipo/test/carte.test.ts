// Un test per ogni carta (e per ogni versione cosmica): l'effetto fa quello che dice il testo nel file dati.
// Giocatore 0 = chi gioca la carta, giocatore 1 = avversario.
import { describe, expect, it } from 'vitest';
import { eliminaDaAzione } from '../src/motore/effetti.js';
import { forzaPresenza, forzaTerritorio } from '../src/motore/queries.js';
import { addEsp } from '../src/motore/operazioni.js';
import {
  cat, energia, esposizione, evento, finisci, gioca, giroIntero, inst, legali, mano, mossa, partita, presenza, totPresenze,
} from './aiuti.js';

const C = 'custodi' as const;
const R = 'risvegliati' as const;
const forza = (g: ReturnType<typeof partita>, t: number, pi: number, i = 0) => forzaPresenza(g, t, pi, g.s.territori[t].presenze[pi][i]);

describe('carte dei Custodi', () => {
  it('CU01 Vedetta di Kingsport: presenza forza 2, costo 1', () => {
    const g = partita(C);
    mano(g, 0, 'CU01');
    gioca(g, 0, 'CU01', { terr: 2 });
    expect(forza(g, 2, 0)).toBe(2);
    expect(g.s.giocatori[0].energia).toBe(19);
  });
  it('CU02 Bibliotecario della Miskatonic: entra, instabilita -1', () => {
    const g = partita(C);
    inst(g, 2, 2);
    mano(g, 0, 'CU02');
    gioca(g, 0, 'CU02', { terr: 2 });
    expect(g.s.territori[2].inst).toBe(1);
    expect(forza(g, 2, 0)).toBe(2);
  });
  it('CU02 versione cosmica: instabilita -1 e pesca 1 carta, potente 1', () => {
    const g = partita(C);
    inst(g, 2, 2);
    mano(g, 0, 'CU02*');
    const mazzo = g.s.giocatori[0].mazzo.length;
    gioca(g, 0, 'CU02*', { terr: 2 });
    // la carta potente aggiunge +2 alla Landa (1 + 1 in piu'), poi -1 dell'effetto
    expect(g.s.territori[2].inst).toBe(2 + 2 - 1);
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 1); // 1 pescata
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('CU03 Membro della Spedizione Pabodie: forza 4; cosmica forza 6 e instabilita +1', () => {
    const g = partita(C);
    mano(g, 0, 'CU03', 'CU03*');
    gioca(g, 0, 'CU03', { terr: 0 });
    expect(forza(g, 0, 0)).toBe(4);
    gioca(g, 0, 'CU03*', { terr: 1 });
    expect(forza(g, 1, 0)).toBe(6);
    expect(g.s.territori[1].inst).toBe(1);
  });
  it('CU04 Henry Armitage: le altre presenze qui hanno +1 forza', () => {
    const g = partita(C);
    mano(g, 0, 'CU01', 'CU04');
    gioca(g, 0, 'CU01', { terr: 0 });
    expect(forza(g, 0, 0, 0)).toBe(2);
    gioca(g, 0, 'CU04', { terr: 0 });
    expect(forza(g, 0, 0, 0)).toBe(3);
    expect(forza(g, 0, 0, 1)).toBe(6);
  });
  it('CU05 Cerchio dei Vigilanti: l instabilita qui non supera 3', () => {
    const g = partita(C);
    inst(g, 0, 4);
    mano(g, 0, 'CU05');
    gioca(g, 0, 'CU05', { terr: 0 });
    expect(g.s.territori[0].inst).toBe(3);
    presenza(g, 1, 0, 'RI01');
    mano(g, 1, 'RI10');
    energia(g, 1, 5);
    finisci(g, 0);
    gioca(g, 1, 'RI10', { terr: 0 });
    expect(g.s.territori[0].inst).toBe(3);
  });
  it('CU06 Lampada di Federal Hill: entra, pesca 1; cosmica pesca 2', () => {
    const g = partita(C);
    mano(g, 0, 'CU06', 'CU06*');
    const mazzo = g.s.giocatori[0].mazzo.length;
    gioca(g, 0, 'CU06', { terr: 2 });
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 1);
    gioca(g, 0, 'CU06*', { terr: 2 });
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 3);
  });
  it('CU07 Professor Rice: all inizio del tuo turno instabilita -1', () => {
    const g = partita(C);
    presenza(g, 0, 2, 'CU07');
    inst(g, 2, 3);
    evento(g, 'E06'); // un evento che non tocca l'instabilita'
    giroIntero(g);
    expect(g.s.territori[2].inst).toBe(2);
  });
  it('CU08 Fattoria Barricata: non puo essere eliminata da azioni che costano 4 o meno (CT-DES-064)', () => {
    const g = partita(C);
    const p = presenza(g, 0, 0, 'CU08');
    eliminaDaAzione(g, 0, 0, p, 2);
    eliminaDaAzione(g, 0, 0, p, 4);
    expect(totPresenze(g, 0, 0)).toBe(1);
    eliminaDaAzione(g, 0, 0, p, 5);
    expect(totPresenze(g, 0, 0)).toBe(0);
  });
  it('CU08: resiste a Polvere di Ibn Ghazi (costo 3), che pure la sceglie come bersaglio', () => {
    const g = partita(C);
    const f = presenza(g, 1, 0, 'CU08'); // forza 3: bersaglio valido per forza 3 o meno
    mano(g, 0, 'CU15');
    gioca(g, 0, 'CU15', { pres: f.uid });
    expect(totPresenze(g, 0, 1)).toBe(1);
  });
  it('CU09 Pietra Stellata di Mnar: entra, se puoi porre un Sigillo lo poni gratis', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    mano(g, 0, 'CU09');
    gioca(g, 0, 'CU09', { terr: 0 });
    expect(Object.keys(g.s.giocatori[0].tappe)).toEqual(['0']);
    expect(g.s.giocatori[0].energia).toBe(16); // solo il costo della carta (4)
  });
  it('CU09: senza le condizioni non pone nulla', () => {
    const g = partita(C);
    inst(g, 0, 4);
    presenza(g, 0, 0, 'CU03');
    mano(g, 0, 'CU09');
    gioca(g, 0, 'CU09', { terr: 0 });
    expect(Object.keys(g.s.giocatori[0].tappe)).toEqual([]);
  });
  it('CU10 Sonno senza Sogni: instabilita di un territorio -1', () => {
    const g = partita(C);
    inst(g, 1, 3);
    mano(g, 0, 'CU10');
    gioca(g, 0, 'CU10', { terr: 1 });
    expect(g.s.territori[1].inst).toBe(2);
  });
  it('CU11 Lucidita: la tua esposizione -1', () => {
    const g = partita(C);
    esposizione(g, 0, 4);
    mano(g, 0, 'CU11');
    gioca(g, 0, 'CU11');
    expect(g.s.giocatori[0].esposizione).toBe(3);
  });
  it('CU12 Rinforzi da Arkham: una tua presenza +2 forza fino a fine partita', () => {
    const g = partita(C);
    const p = presenza(g, 0, 0, 'CU01');
    mano(g, 0, 'CU12');
    gioca(g, 0, 'CU12', { pres: p.uid });
    expect(forza(g, 0, 0)).toBe(4);
    giroIntero(g);
    expect(forza(g, 0, 0)).toBe(4);
  });
  it('CU13 Esorcismo di Armitage: rimuove un rito non consolidato da un territorio che controlli', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    mano(g, 0, 'CU13');
    gioca(g, 0, 'CU13', { terr: 0 });
    expect(g.s.giocatori[1].tappe[0]).toBeUndefined();
  });
  it('CU13: un rito consolidato non si puo togliere', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati - 2;
    mano(g, 0, 'CU13');
    expect(legali(g).some((m) => m.t === 'gioca')).toBe(false);
  });
  it('CU14 Studio del Necronomicon (CT-DES-068): in questo turno il Sigillo si pone anche con instabilità 4, e solo in questo turno', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    inst(g, 0, 4);
    mano(g, 0, 'CU14');
    const tappa = (terr: number) => legali(g).some((m) => m.t === 'tappa' && m.terr === terr);
    expect(tappa(0)).toBe(false); // senza la carta, instabilita' 4: no
    gioca(g, 0, 'CU14');
    expect(g.s.giocatori[0].energia).toBe(19); // la carta costa 1
    expect(tappa(0)).toBe(true);
    const e = g.s.giocatori[0].energia;
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].energia).toBe(e - 2); // il Sigillo costa sempre 2: niente sconto
    expect(g.s.giocatori[0].tappe[0]).toBeDefined();
    // l'effetto finisce a fine turno
    finisci(g, 0);
    expect(g.s.giocatori[0].aperturaTappa).toBe(false);
    finisci(g, 1);
    energia(g, 0, 20);
    presenza(g, 0, 1, 'CU03');
    inst(g, 1, 4);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 1)).toBe(false);
  });
  it('CU14 Studio del Necronomicon: vale per tutte le tappe del turno; le altre condizioni restano', () => {
    const g = partita(C);
    presenza(g, 0, 0, 'CU03');
    presenza(g, 0, 1, 'CU03');
    inst(g, 0, 4);
    inst(g, 1, 4);
    inst(g, 2, 4); // senza presenze: non lo controlli
    mano(g, 0, 'CU14');
    gioca(g, 0, 'CU14');
    mossa(g, 0, { t: 'tappa', terr: 0 });
    const ter = legali(g).filter((m) => m.t === 'tappa').map((m) => (m.t === 'tappa' ? m.terr : -1));
    expect(ter).toEqual([1]); // il secondo Sigillo si puo' porre; il territorio non controllato no
    inst(g, 1, 5); // instabilita' 5: oltre la soglia spostata
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false);
  });
  it('CU14 Studio del Necronomicon: non cambia Esorcismo di Armitage (CU13)', () => {
    const g = partita(C);
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    presenza(g, 0, 0, 'CU03');
    mano(g, 0, 'CU14', 'CU13');
    const esorcismi = () => legali(g).filter((m) => m.t === 'gioca' && g.s.giocatori[0].mano.find((c) => c.uid === m.carta)?.id === 'CU13').length;
    const prima = esorcismi();
    gioca(g, 0, 'CU14');
    expect(esorcismi()).toBe(prima);
  });
  it('CU15 Polvere di Ibn Ghazi: elimina una presenza avversaria con forza 3 o meno', () => {
    const g = partita(C);
    const debole = presenza(g, 1, 0, 'RI03'); // forza 2
    presenza(g, 1, 0, 'RI04'); // forza 4: non bersaglio
    mano(g, 0, 'CU15');
    const bersagli = legali(g).filter((m) => m.t === 'gioca').map((m) => (m.t === 'gioca' ? m.pres : -1));
    expect(bersagli).toEqual([debole.uid]);
    gioca(g, 0, 'CU15', { pres: debole.uid });
    expect(g.s.territori[0].presenze[1].map((p) => p.carta.id)).toEqual(['RI04']);
  });
  it('CU16 Osservatorio della Miskatonic: pesca 2 carte', () => {
    const g = partita(C);
    mano(g, 0, 'CU16');
    gioca(g, 0, 'CU16');
    expect(g.s.giocatori[0].mano).toHaveLength(2);
  });
  it('CU17 Le Stelle Non Sono Giuste: instabilita di tutti i territori -2; potente 1', () => {
    const g = partita(C);
    for (const t of [0, 1, 2]) inst(g, t, 4);
    mano(g, 0, 'CU17');
    gioca(g, 0, 'CU17');
    expect(g.s.territori.map((t) => t.inst)).toEqual([2, 2, 2]);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('CU18 Fuoco Purificatore: elimina le presenze avversarie con forza 2 o meno su un territorio', () => {
    const g = partita(C);
    presenza(g, 1, 0, 'RI01');
    presenza(g, 1, 0, 'RI03');
    presenza(g, 1, 0, 'RI04');
    presenza(g, 1, 1, 'RI01');
    mano(g, 0, 'CU18');
    gioca(g, 0, 'CU18', { terr: 0 });
    expect(g.s.territori[0].presenze[1].map((p) => p.carta.id)).toEqual(['RI04']);
    expect(totPresenze(g, 1, 1)).toBe(1);
    expect(g.s.giocatori[0].esposizione).toBe(2);
  });
});

describe('carte dei Risvegliati', () => {
  it('RI01 Iniziato dell Ordine di Dagon: entra, instabilita +1; cosmica +2', () => {
    const g = partita(R);
    mano(g, 0, 'RI01', 'RI01*');
    gioca(g, 0, 'RI01', { terr: 1 });
    expect(g.s.territori[1].inst).toBe(1);
    expect(forza(g, 1, 0)).toBe(1);
    gioca(g, 0, 'RI01*', { terr: 0 });
    expect(g.s.territori[0].inst).toBe(2);
    expect(forza(g, 0, 0)).toBe(2);
  });
  it('RI02 Cultista delle Paludi: +1 forza con instabilita 3 o piu; cosmica +2', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI02');
    presenza(g, 0, 1, 'RI02*');
    expect(forza(g, 0, 0)).toBe(2);
    expect(forza(g, 1, 0)).toBe(3);
    inst(g, 0, 3);
    inst(g, 1, 3);
    expect(forza(g, 0, 0)).toBe(3);
    expect(forza(g, 1, 0)).toBe(5);
  });
  it('RI03 Sognatore di R lyeh: pesca 1; cosmica 2; potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'RI03', 'RI03*');
    const mazzo = g.s.giocatori[0].mazzo.length;
    gioca(g, 0, 'RI03', { terr: 0 });
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 1);
    gioca(g, 0, 'RI03*', { terr: 2 });
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 3);
    expect(g.s.giocatori[0].esposizione).toBe(2);
  });
  it('RI04 Profondo di Innsmouth: forza 4; cosmica forza 6 potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'RI04', 'RI04*');
    gioca(g, 0, 'RI04', { terr: 0 });
    gioca(g, 0, 'RI04*', { terr: 1 });
    expect(forza(g, 0, 0)).toBe(4);
    expect(forza(g, 1, 0)).toBe(6);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('RI05 Pescatore di Innsmouth: all inizio del tuo turno instabilita +1', () => {
    const g = partita(R);
    presenza(g, 0, 2, 'RI05');
    evento(g, 'E06');
    giroIntero(g);
    expect(g.s.territori[2].inst).toBe(1);
  });
  it('RI06 Lavinia Whateley: i riti qui costano 1 energia in meno', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI06');
    inst(g, 0, 3);
    const e = g.s.giocatori[0].energia;
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].energia).toBe(e - 1);
  });
  it('RI07 Il Tenebroso: entra, una presenza avversaria qui -1 forza; cosmica -2', () => {
    const g = partita(R);
    const v = presenza(g, 1, 0, 'CU03');
    mano(g, 0, 'RI07', 'RI07*');
    expect(legali(g).some((m) => m.t === 'gioca' && m.terr === 0 && m.pres === v.uid)).toBe(true);
    gioca(g, 0, 'RI07', { terr: 0, pres: v.uid });
    expect(forzaPresenza(g, 0, 1, v)).toBe(3);
    gioca(g, 0, 'RI07*', { terr: 0, pres: v.uid });
    expect(forzaPresenza(g, 0, 1, v)).toBe(1);
    giroIntero(g); // il malus dura fino a fine partita
    expect(forzaPresenza(g, 0, 1, v)).toBe(1);
  });
  it('RI08 Shoggoth: forza 6, potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'RI08');
    gioca(g, 0, 'RI08', { terr: 0 });
    expect(forza(g, 0, 0)).toBe(6);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('RI09 Effigie di Cthulhu: conta per i riti, non per il controllo', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI09');
    inst(g, 0, 3);
    expect(g.s.territori[0].controllo).toBeNull();
    expect(forzaTerritorio(g, 0, 0)).toBe(0);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 0)).toBe(true);
  });
  it('RI10 Sussurro dalla Cripta: instabilita +1; cosmica +2', () => {
    const g = partita(R);
    mano(g, 0, 'RI10', 'RI10*');
    gioca(g, 0, 'RI10', { terr: 1 });
    expect(g.s.territori[1].inst).toBe(1);
    gioca(g, 0, 'RI10*', { terr: 1 });
    expect(g.s.territori[1].inst).toBe(3);
  });
  it('RI11 Patto con i Profondi: +2 energia, costo 0, potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'RI11');
    const e = g.s.giocatori[0].energia;
    gioca(g, 0, 'RI11');
    expect(g.s.giocatori[0].energia).toBe(e + 2);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('RI12 Profanazione: rimuove un Sigillo non consolidato (inst 3+, presenza, forza almeno pari)', () => {
    const g = partita(R);
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    presenza(g, 0, 0, 'RI04');
    mano(g, 0, 'RI12');
    expect(legali(g).some((m) => m.t === 'gioca')).toBe(false); // instabilita' 0
    inst(g, 0, 3);
    gioca(g, 0, 'RI12', { terr: 0 });
    expect(g.s.giocatori[1].tappe[0]).toBeUndefined();
  });
  it('RI13 Sogni di R lyeh: pesca 2, potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'RI13');
    gioca(g, 0, 'RI13');
    expect(g.s.giocatori[0].mano).toHaveLength(2);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('RI14 L Aspetto di Innsmouth: una presenza avversaria -2 forza fino a fine partita', () => {
    const g = partita(R);
    const v = presenza(g, 1, 0, 'CU03');
    mano(g, 0, 'RI14');
    gioca(g, 0, 'RI14', { pres: v.uid });
    expect(forzaPresenza(g, 0, 1, v)).toBe(2);
  });
  it('RI15 Formula di Dho-Hna (CT-DES-068): in questo turno il rito si completa anche con instabilità 2, e solo in questo turno', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI04');
    inst(g, 0, 2);
    mano(g, 0, 'RI15');
    const tappa = (terr: number) => legali(g).some((m) => m.t === 'tappa' && m.terr === terr);
    expect(tappa(0)).toBe(false); // senza la carta, instabilita' 2: no
    gioca(g, 0, 'RI15');
    expect(g.s.giocatori[0].energia).toBe(19); // la carta costa 1
    expect(tappa(0)).toBe(true);
    const e = g.s.giocatori[0].energia;
    mossa(g, 0, { t: 'tappa', terr: 0 });
    expect(g.s.giocatori[0].energia).toBe(e - 2); // il rito costa sempre 2: niente sconto
    expect(g.s.giocatori[0].tappe[0]).toBeDefined();
    // l'effetto finisce a fine turno
    finisci(g, 0);
    expect(g.s.giocatori[0].aperturaTappa).toBe(false);
    finisci(g, 1);
    energia(g, 0, 20);
    presenza(g, 0, 1, 'RI04');
    inst(g, 1, 2);
    expect(legali(g).some((m) => m.t === 'tappa' && m.terr === 1)).toBe(false);
  });
  it('RI15 Formula di Dho-Hna: le altre condizioni restano (presenza, forza, instabilità almeno 2)', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI01'); // forza bassa
    presenza(g, 1, 0, 'CU05'); // avversario piu' forte
    presenza(g, 1, 0, 'CU05');
    presenza(g, 0, 1, 'RI04');
    inst(g, 0, 2);
    inst(g, 1, 1); // instabilita' 1: sotto la soglia spostata
    inst(g, 2, 2); // senza una tua presenza
    mano(g, 0, 'RI15');
    gioca(g, 0, 'RI15');
    expect(forzaTerritorio(g, 0, 0)).toBeLessThan(forzaTerritorio(g, 0, 1));
    expect(legali(g).some((m) => m.t === 'tappa')).toBe(false);
  });
  it('RI15 Formula di Dho-Hna: non cambia la Profanazione (RI12)', () => {
    const g = partita(R);
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    presenza(g, 0, 0, 'RI04');
    inst(g, 0, 2);
    mano(g, 0, 'RI15', 'RI12');
    gioca(g, 0, 'RI15');
    // la Profanazione richiede ancora instabilita' 3 o piu'
    expect(legali(g).some((m) => m.t === 'gioca' && g.s.giocatori[0].mano.find((c) => c.uid === m.carta)?.id === 'RI12')).toBe(false);
    inst(g, 0, 3);
    expect(legali(g).some((m) => m.t === 'gioca' && g.s.giocatori[0].mano.find((c) => c.uid === m.carta)?.id === 'RI12')).toBe(true);
  });
  it('RI16 Benedizione di Yog-Sothoth: una tua presenza +3 forza, potente 1', () => {
    const g = partita(R);
    const p = presenza(g, 0, 0, 'RI01');
    mano(g, 0, 'RI16');
    gioca(g, 0, 'RI16', { pres: p.uid });
    expect(forza(g, 0, 0)).toBe(4);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('RI17 Yog-Sothoth Apre la Porta: instabilita +1 ovunque; elimina una presenza avversaria con forza 2 o meno', () => {
    const g = partita(R);
    const v = presenza(g, 1, 1, 'CU01');
    mano(g, 0, 'RI17');
    gioca(g, 0, 'RI17', { pres: v.uid });
    expect(totPresenze(g, 1, 1)).toBe(0);
    // +1 ovunque e +1 dalla carta potente sul territorio della vittima
    expect(g.s.territori.map((t) => t.inst)).toEqual([1, 2, 1]);
    expect(g.s.giocatori[0].esposizione).toBe(2);
  });
  it('RI18 Dagon Emerge: elimina tutte le presenze con forza 3 o meno su un territorio, anche le tue', () => {
    const g = partita(R);
    presenza(g, 0, 0, 'RI01');
    presenza(g, 0, 0, 'RI04');
    presenza(g, 1, 0, 'CU01');
    presenza(g, 1, 0, 'CU03');
    mano(g, 0, 'RI18');
    gioca(g, 0, 'RI18', { terr: 0 });
    expect(g.s.territori[0].presenze[0].map((p) => p.carta.id)).toEqual(['RI04']);
    expect(g.s.territori[0].presenze[1].map((p) => p.carta.id)).toEqual(['CU03']);
    expect(g.s.giocatori[0].esposizione).toBe(2);
  });
});

describe('carte di riserva dei territori', () => {
  it('T1r Diario di Zadok Allen: pesca 1 e vede il tipo dei prossimi 2 eventi', () => {
    const g = partita(C);
    mano(g, 0, 'T1r');
    gioca(g, 0, 'T1r');
    expect(g.s.giocatori[0].mano).toHaveLength(1);
    expect(g.s.giocatori[0].eventiVisti).toHaveLength(2);
    for (const t of g.s.giocatori[0].eventiVisti) expect(['territorio', 'giocatore', 'campo', 'carte', '?']).toContain(t);
  });
  it('T2r Pagina del Necronomicon: cerca una carta azione nel mazzo e la mette in mano, potente 1', () => {
    const g = partita(R);
    mano(g, 0, 'T2r');
    const mazzo = g.s.giocatori[0].mazzo.length;
    const mosse = legali(g).filter((m) => m.t === 'gioca');
    expect(mosse.length).toBeGreaterThan(1);
    const cerca = 'RI13';
    gioca(g, 0, 'T2r', { cerca });
    expect(g.s.giocatori[0].mano.map((c) => c.id)).toEqual([cerca]);
    expect(g.s.giocatori[0].mazzo.length).toBe(mazzo - 1);
    expect(g.s.giocatori[0].esposizione).toBe(1);
  });
  it('T3r Frammento del Meteorite: +1 energia, costo 0', () => {
    const g = partita(C);
    mano(g, 0, 'T3r');
    const e = g.s.giocatori[0].energia;
    gioca(g, 0, 'T3r');
    expect(g.s.giocatori[0].energia).toBe(e + 1);
  });
});

describe('ogni carta dei dati ha un test (copertura)', () => {
  it('tutte le carte del catalogo sono nominate in questo file', async () => {
    const { readFileSync } = await import('node:fs');
    const sorgente = readFileSync(new URL(import.meta.url), 'utf-8');
    for (const id of cat.carte.keys()) expect(sorgente, id).toContain(id.replace(/^(\w+?)$/, '$1'));
    void addEsp;
  });
});
