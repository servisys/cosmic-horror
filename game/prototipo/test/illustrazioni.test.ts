// Le illustrazioni: ogni carta, versione cosmica, evento, territorio e riserva ha la sua immagine leggera.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cat } from './aiuti.js';

const CARTELLA = join(import.meta.dirname, '..', 'src', 'assets', 'illustrazioni');

describe('illustrazioni', () => {
  const attesi: string[] = [];
  for (const id of cat.carte.keys()) {
    attesi.push(id);
    if (cat.carte.get(id)!.versione_cosmica) attesi.push(id + 'c');
  }
  for (const id of cat.eventi.keys()) attesi.push(id);
  for (const t of cat.dati.territori) attesi.push(t.id);

  it('ogni carta (anche cosmica), evento e territorio ha un file WebP con nome = id', () => {
    const mancanti = attesi.filter((id) => !existsSync(join(CARTELLA, id + '.webp')));
    expect(mancanti).toEqual([]);
    expect(attesi.length).toBe(71);
  });
  it('non ci sono file di troppo', () => {
    const presenti = readdirSync(CARTELLA).map((f) => f.replace('.webp', '')).sort();
    expect(presenti).toEqual([...attesi].sort());
  });
  it('sono leggere: ognuna sotto 120 KB e il totale sotto 4 MB', () => {
    let tot = 0;
    for (const f of readdirSync(CARTELLA)) {
      const kb = statSync(join(CARTELLA, f)).size / 1024;
      expect(kb, f).toBeLessThan(120);
      tot += kb;
    }
    expect(tot).toBeLessThan(4096);
  });
});
