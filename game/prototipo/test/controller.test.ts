// Il controller dell'interfaccia: si puo' giocare una partita completa usando solo le sue funzioni di selezione e di mossa.
import { describe, expect, it } from 'vitest';
import { sceglieMossa } from '../src/computer/computer.js';
import type { FazioneId } from '../src/dati/tipi.js';
import { riproduci } from '../src/motore/motore.js';
import type { Mossa } from '../src/motore/stato.js';
import { Controller } from '../src/ui/controller.js';
import { cat, inst, mano, partita as partitaDi, presenza } from './aiuti.js';

/** Esegue la mossa scelta dal "giocatore" passando solo da cio' che l'interfaccia puo' fare. */
function giocaUmano(c: Controller, m: Mossa): void {
  switch (m.t) {
    case 'fine': expect(c.fine()).toBe(true); return;
    case 'riduci': expect(c.riduci()).toBe(true); return;
    case 'tappa': expect(c.tappa(m.terr)).toBe(true); return;
    case 'riordina': expect(c.riordina(m.ordine)).toBe(true); return;
    case 'pietre': expect(c.pietre(m.terr, m.segno)).toBe(true); return;
    case 'gioca': {
      c.scegliCarta(m.carta);
      expect(c.selezione.carta).toBe(m.carta);
      let fatto = false;
      if (m.terr !== undefined) fatto = c.scegliTerritorio(m.terr);
      if (!fatto && m.segno !== undefined) fatto = c.scegliSegno(m.segno);
      if (!fatto && m.pres !== undefined) fatto = c.scegliPresenza(m.pres);
      if (!fatto && m.cerca !== undefined) fatto = c.scegliCerca(m.cerca);
      if (!fatto) fatto = c.giocaSelezionata();
      expect(fatto).toBe(true);
    }
  }
}

function partita(fazione: FazioneId, seme: number): Controller {
  const c = new Controller(cat.dati);
  c.nuova(fazione, seme);
  let guardia = 0;
  while (!c.finita) {
    if (guardia++ > 20000) throw new Error('partita infinita');
    if (c.tocca_al_computer) c.passoComputer();
    else giocaUmano(c, sceglieMossa(c.vista(), cat));
  }
  return c;
}

describe('controller dell interfaccia', () => {
  it('prima di scegliere la fazione non c e una partita attiva (il ridisegno non deve toccare lo stato)', () => {
    const c = new Controller(cat.dati);
    expect(c.attiva).toBe(false);
    c.nuova('custodi', 1);
    expect(c.attiva).toBe(true);
  });
  for (const f of ['custodi', 'risvegliati'] as const) {
    it(`partita completa dei ${f} usando solo le funzioni dell interfaccia`, () => {
      for (const seme of [1, 2, 3, 4, 5]) {
        const c = partita(f, seme);
        expect(c.finita).toBe(true);
        expect(c.registroTesto()).toContain('"mosse"');
      }
    });
  }
  it('Pietre ritte: solo con il controllo di Dunwich, una volta per turno, dal controller', () => {
    const g = partitaDi('custodi');
    const c = new Controller(cat.dati);
    c.g = g;
    c.umano = 0;
    expect(c.puoPietre()).toBe(false);
    presenza(g, 0, 3, 'CU03'); // controlla Dunwich
    expect(c.puoPietre()).toBe(true);
    const mosse = c.pietreRitte();
    expect(mosse.every((m) => m.terr !== 3)).toBe(true); // mai Dunwich stesso
    expect(c.pietre(3, 1)).toBe(false);
    const e0 = g.s.giocatori[0].energia;
    expect(c.pietre(4, 1)).toBe(true);
    expect(g.s.territori[4].inst).toBe(1);
    expect(g.s.giocatori[0].energia).toBe(e0 - 1);
    expect(c.puoPietre()).toBe(false); // una volta per turno
  });
  it('Pietra Incisa: dopo il territorio si sceglie il segno; con un solo segno possibile la scelta e gia fatta', () => {
    const g = partitaDi('custodi');
    const c = new Controller(cat.dati);
    c.g = g;
    c.umano = 0;
    mano(g, 0, 'T4r');
    inst(g, 2, 3);
    const uid = c.vista().mano[0].uid;
    c.scegliCarta(uid);
    expect(c.opzioni().terr).toHaveLength(5);
    expect(c.opzioni().segni).toEqual([]); // prima il territorio
    expect(c.scegliTerritorio(2)).toBe(false); // instabilita 3: servono tutti e due i segni, si chiede
    expect(c.opzioni().segni.sort()).toEqual([-1, 1]);
    expect(c.opzioni().pronta).toBe(false);
    expect(c.scegliSegno(-1)).toBe(true);
    expect(g.s.territori[2].inst).toBe(2);
    // instabilita 0: si puo solo salire, quindi il territorio decide la mossa
    mano(g, 0, 'T4r');
    c.scegliCarta(c.vista().mano[0].uid);
    expect(c.scegliTerritorio(0)).toBe(true);
    expect(g.s.territori[0].inst).toBe(1);
  });
  it('il registro copiato con lo stesso seme rigioca la stessa partita', () => {
    const c = partita('risvegliati', 11);
    const r = JSON.parse(c.registroTesto());
    const g = riproduci(cat, { seme: r.seme }, r.mosse);
    expect(JSON.stringify(g.s)).toBe(JSON.stringify(c.g.s));
  });
  it('una carta non giocabile non si seleziona; un secondo tocco deseleziona', () => {
    const c = new Controller(cat.dati);
    c.nuova('custodi', 1);
    while (!c.tuoTurno) c.passoComputer();
    const v = c.vista();
    const costosa = v.mano.find((x) => x.costo > v.energia);
    if (costosa) { c.scegliCarta(costosa.uid); expect(c.selezione.carta).toBeUndefined(); }
    const buona = v.mano.find((x) => c.giocabile(x.uid))!;
    c.scegliCarta(buona.uid);
    expect(c.selezione.carta).toBe(buona.uid);
    c.scegliCarta(buona.uid);
    expect(c.selezione.carta).toBeUndefined();
  });
  it('un evento cosmico risolto viene segnalato una volta', () => {
    const c = new Controller(cat.dati);
    c.nuova('custodi', 2);
    let visti = 0;
    let g = 0;
    while (visti < 2 && g++ < 5000) {
      if (c.tocca_al_computer) c.passoComputer(); else giocaUmano(c, { t: 'fine' });
      if (c.evento) { visti++; c.chiudiEvento(); }
    }
    expect(visti).toBe(2);
  });
});
