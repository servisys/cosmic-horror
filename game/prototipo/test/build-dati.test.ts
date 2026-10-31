// I dati che entrano nella build del browser sono gli stessi letti da disco (unica fonte: docs/03-cards-content/).
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datiDelBuild } from '../src/ui/dati-build.js';
import { cat } from './aiuti.js';

describe('dati della build', () => {
  it('sono identici ai dati letti da disco e passano il controllo', async () => {
    const b = datiDelBuild();
    expect(b.fileCarte).toBe(basename(cat.dati.fileCarte));
    expect(JSON.stringify({ f: b.fazioni, t: b.territori, e: b.eventi })).toBe(JSON.stringify({ f: cat.dati.fazioni, t: cat.dati.territori, e: cat.dati.eventi }));
    const { controllaDati } = await import('../src/dati/controllo.js');
    expect(controllaDati(b).errori).toEqual([]);
  });
});
