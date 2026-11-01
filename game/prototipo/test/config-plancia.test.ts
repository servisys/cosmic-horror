// Configurazione della plancia: i territori attivi corrispondono ai dati, le zone stanno dentro l'immagine e la posizione sullo schermo (cover) torna.
import { describe, expect, it } from 'vitest';
import { IMG_H, IMG_W, SETTORI, coverTrasformazione, inSchermo, settoreDelTerritorio } from '../src/ui/config-plancia.js';
import { cat } from './aiuti.js';

describe('configurazione della plancia', () => {
  it('cinque settori: tre in gioco (con territorio nei dati), Dunwich e R\'lyeh visibili ma non in gioco', () => {
    expect(SETTORI.map((s) => s.id)).toEqual(['innsmouth', 'biblioteca', 'dunwich', 'landa', 'rlyeh']);
    const attivi = SETTORI.filter((s) => s.territorioId !== null);
    expect(attivi.map((s) => s.id)).toEqual(['innsmouth', 'biblioteca', 'landa']);
    for (const s of attivi) expect(cat.dati.territori.some((t) => t.id === s.territorioId), s.id).toBe(true);
    // ogni territorio dei dati ha il suo settore sulla plancia
    for (const t of cat.dati.territori) expect(settoreDelTerritorio(t.id), t.id).toBeDefined();
    expect(SETTORI.filter((s) => s.territorioId === null).map((s) => s.id)).toEqual(['dunwich', 'rlyeh']);
  });
  it('le zone stanno dentro l\'immagine e i quadri non si sovrappongono (il pozzo, tondo, si sovrappone ai quattro)', () => {
    for (const s of SETTORI) {
      expect(s.zona.x, s.id).toBeGreaterThanOrEqual(0);
      expect(s.zona.y, s.id).toBeGreaterThanOrEqual(0);
      expect(s.zona.x + s.zona.w, s.id).toBeLessThanOrEqual(1);
      expect(s.zona.y + s.zona.h, s.id).toBeLessThanOrEqual(1);
    }
    const quadri = SETTORI.filter((s) => s.id !== 'rlyeh');
    for (const a of quadri) {
      for (const b of quadri) {
        if (a === b) continue;
        const dentro = a.zona.x < b.zona.x + b.zona.w && b.zona.x < a.zona.x + a.zona.w && a.zona.y < b.zona.y + b.zona.h && b.zona.y < a.zona.y + a.zona.h;
        expect(dentro, `${a.id} / ${b.id}`).toBe(false);
      }
    }
  });
  it('lo sfondo copre tutto lo schermo senza deformarsi (cover) e le zone si ritagliano sullo schermo', () => {
    for (const [W, H] of [[956, 440], [1280, 800], [800, 1280]] as const) {
      const { k, ox, oy } = coverTrasformazione(W, H);
      expect(IMG_W * k).toBeGreaterThanOrEqual(W - 0.001);
      expect(IMG_H * k).toBeGreaterThanOrEqual(H - 0.001);
      expect(ox).toBeLessThanOrEqual(0.001);
      expect(oy).toBeLessThanOrEqual(0.001);
      for (const s of SETTORI) {
        const r = inSchermo(s.zona, W, H);
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(W + 0.001);
        expect(r.y + r.h).toBeLessThanOrEqual(H + 0.001);
      }
    }
    // a 956x440 il rapporto dell'immagine coincide con quello dello schermo: nessun taglio
    const r = coverTrasformazione(956, 440);
    expect(Math.abs(r.ox)).toBeLessThan(1);
  });
});
