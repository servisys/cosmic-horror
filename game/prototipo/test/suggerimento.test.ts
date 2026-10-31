// Aiuti di gioco: la riga di suggerimento, i motivi per cui un'azione non si puo' fare e i testi del tutorial.
import { describe, expect, it } from 'vitest';
import { creaVista } from '../src/motore/vista.js';
import { motivoCartaNonGiocabile, motivoTappa, passiTutorial, suggerimento } from '../src/ui/suggerimento.js';
import { energia, esposizione, finisci, inst, mano, partita, presenza } from './aiuti.js';

const sug = (g: ReturnType<typeof partita>) => suggerimento(creaVista(g, 0));

describe('riga di suggerimento', () => {
  it('Custodi: puoi porre un Sigillo, con il nome del territorio e il costo', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    const s = sug(g)!;
    expect(s.tipo).toBe('puoi-tappa');
    expect(s.testo).toBe('Puoi porre un Sigillo a Innsmouth: tocca «Poni Sigillo» su quel territorio (costa 2).');
  });
  it('Risvegliati: puoi completare un rito (con la preposizione giusta)', () => {
    const g = partita('risvegliati');
    presenza(g, 0, 1, 'RI04');
    inst(g, 1, 3);
    const s = sug(g)!;
    expect(s.tipo).toBe('puoi-tappa');
    expect(s.testo).toContain('Puoi completare un rito alla Biblioteca della Miskatonic');
    expect(s.testo).toContain('«Completa rito»');
  });
  it('il tuo Sigillo non e ancora al sicuro', () => {
    const g = partita('custodi');
    presenza(g, 0, 2, 'CU03');
    g.s.giocatori[0].tappe[2] = g.s.turniCompletati; // appena posto
    energia(g, 0, 1);
    mano(g, 0, 'CU01');
    const s = sug(g)!;
    expect(s.tipo).toBe('tappa-non-sicura');
    expect(s.testo).toContain('Il tuo Sigillo alla Landa Maledetta non è ancora al sicuro');
  });
  it('un Sigillo consolidato non da piu quel consiglio', () => {
    const g = partita('custodi');
    presenza(g, 0, 2, 'CU03');
    g.s.giocatori[0].tappe[2] = g.s.turniCompletati - 3;
    energia(g, 0, 1);
    mano(g, 0, 'CU01');
    expect(sug(g)!.tipo).not.toBe('tappa-non-sicura');
  });
  it('Custodi: instabilita salita sopra 3', () => {
    const g = partita('custodi');
    presenza(g, 0, 0, 'CU03');
    inst(g, 0, 4);
    const s = sug(g)!;
    expect(s.tipo).toBe('instabilita');
    expect(s.testo).toBe('L\'instabilità di Innsmouth è salita sopra 3: lì non puoi più porre Sigilli finché non la abbassi.');
  });
  it('gioca una presenza: ti mancano N punti di forza', () => {
    const g = partita('custodi');
    presenza(g, 1, 1, 'RI04'); // 4 contro 0
    mano(g, 0, 'CU01');
    const s = sug(g)!;
    expect(s.tipo).toBe('forza-mancante');
    expect(s.testo).toBe('Gioca una presenza alla Biblioteca della Miskatonic: ti mancano 5 punti di forza per controllarlo.');
  });
  it('senza avversario sul territorio: ora nessuno lo controlla', () => {
    const g = partita('custodi');
    mano(g, 0, 'CU01');
    const s = sug(g)!;
    expect(s.tipo).toBe('forza-mancante');
    expect(s.testo).toBe('Gioca una presenza a Innsmouth: ora nessuno lo controlla, con una presenza lo prendi.');
  });
  it('hai finito l energia: tocca Fine turno', () => {
    const g = partita('custodi');
    energia(g, 0, 0);
    mano(g, 0, 'CU01');
    const s = sug(g)!;
    expect(s.tipo).toBe('energia-finita');
    expect(s.testo).toBe('Hai finito l\'energia: tocca «Fine turno».');
  });
  it('l avversario e a una tappa dalla vittoria', () => {
    const g = partita('custodi');
    g.s.giocatori[1].tappe[0] = g.s.turniCompletati;
    g.s.giocatori[1].tappe[1] = g.s.turniCompletati;
    g.s.giocatori[1].segnale = 0;
    mano(g, 0, 'CU01');
    const s = sug(g)!;
    expect(s.tipo).toBe('avversario-un-passo');
    expect(s.testo).toContain('Lui è a una tappa dalla vittoria');
  });
  it('altrimenti: tocca una carta e poi un territorio', () => {
    const g = partita('custodi');
    mano(g, 0, 'CU16');
    const s = sug(g)!;
    expect(s.tipo).toBe('tocca-una-carta');
    expect(s.testo).toContain('Hai 20 di energia');
  });
  it('nessun suggerimento quando non e il tuo turno o c e una scelta in sospeso', () => {
    const g = partita('custodi');
    finisci(g, 0);
    expect(suggerimento(creaVista(g, 0))).toBeNull();
    const h = partita('custodi');
    presenza(h, 0, 1, 'CU01', { riordina: true }); // la Biblioteca chiede il riordino
    expect(h.s.decisione).not.toBeNull();
    expect(suggerimento(creaVista(h, 0))).toBeNull();
  });
});

describe('motivo per cui non si puo\' porre il Sigillo o completare il rito', () => {
  const motivo = (g: ReturnType<typeof partita>, t: number) => motivoTappa(creaVista(g, 0), creaVista(g, 0).territori[t]);
  it('Custodi: non controlli, instabilita alta, energia, gia posto', () => {
    const g = partita('custodi');
    expect(motivo(g, 0)).toBe('non controlli');
    presenza(g, 0, 0, 'CU03');
    expect(motivo(g, 0)).toBeNull();
    inst(g, 0, 4);
    expect(motivo(g, 0)).toBe('instabilità 4 (max 3)');
    inst(g, 0, 3);
    energia(g, 0, 1);
    expect(motivo(g, 0)).toBe('serve 2 energia');
    g.s.giocatori[0].tappe[0] = g.s.turniCompletati;
    expect(motivo(g, 0)).toBe('Sigillo già posto');
  });
  it('Risvegliati: presenza, forza, instabilita', () => {
    const g = partita('risvegliati');
    expect(motivo(g, 0)).toBe('serve una tua presenza');
    presenza(g, 0, 0, 'RI01');
    presenza(g, 1, 0, 'CU03');
    expect(motivo(g, 0)).toBe('forza di Lui maggiore');
    presenza(g, 0, 0, 'RI08');
    expect(motivo(g, 0)).toBe('instabilità 0 (servono 3)');
    inst(g, 0, 3);
    expect(motivo(g, 0)).toBeNull();
  });
});

describe('motivo per cui una carta non si puo\' giocare', () => {
  it('costo maggiore dell energia', () => {
    const g = partita('custodi');
    energia(g, 0, 2);
    mano(g, 0, 'CU04');
    const v = creaVista(g, 0);
    expect(motivoCartaNonGiocabile(v, v.mano[0])).toBe('Henry Armitage: costa 5, hai 2 di energia.');
  });
  it('senza bersaglio valido', () => {
    const g = partita('custodi');
    mano(g, 0, 'CU12');
    const v = creaVista(g, 0);
    expect(motivoCartaNonGiocabile(v, v.mano[0])).toContain('non c\'è un bersaglio valido');
  });
  it('non e il tuo turno', () => {
    const g = partita('custodi');
    mano(g, 0, 'CU01');
    finisci(g, 0);
    const v = creaVista(g, 0);
    expect(motivoCartaNonGiocabile(v, v.mano[0])).toBe('Non è il tuo turno: aspetta Lui.');
  });
});

describe('tutorial', () => {
  it('6 passi per fazione, con testi brevi e le aree da evidenziare', () => {
    for (const f of ['custodi', 'risvegliati'] as const) {
      const p = passiTutorial(f);
      expect(p).toHaveLength(6);
      for (const x of p) expect(x.testo.length).toBeLessThan(330);
      expect(p.map((x) => x.area)).toEqual([undefined, 'pannello:energia', 'mano:tutta', 'territori:tutti', 'btn:tappa:1', 'btn:fine']);
    }
    expect(passiTutorial('custodi')[0].testo).toContain('3 Sigilli');
    expect(passiTutorial('risvegliati')[0].testo).toContain('3 riti');
  });
  it('esposizione e simili non servono ai testi (vista solo)', () => {
    const g = partita('custodi');
    esposizione(g, 0, 5);
    expect(sug(g)).not.toBeNull();
  });
});
