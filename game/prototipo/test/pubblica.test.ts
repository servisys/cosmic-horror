import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// La logica della pubblicazione (ambiente obbligatorio, token per sito, produzione solo per un commit gia' in prova) si prova in scripts/prova-pubblica.mjs
// con un clone finto, un sito di prova finto e un token finto: nessuna rete, nessun Azure.
describe('pubblicazione prova/produzione', () => {
  it('tutte le verifiche di scripts/prova-pubblica.mjs passano', () => {
    const r = spawnSync(process.execPath, ['scripts/prova-pubblica.mjs'], { encoding: 'utf8' });
    const out = (r.stdout ?? '') + (r.stderr ?? '');
    expect(out).toMatch(/RISULTATO: \d+ ok, 0 ko/);
    expect(r.status, out).toBe(0);
  }, 60000);

  // Il job del Mac (solo prova, una build alla volta) si prova con strumenti/mac-mini/prova-logica.sh; serve una bash (su Windows: Git Bash).
  const haBash = spawnSync('bash', ['--version']).status === 0;
  it.skipIf(!haBash)('tutte le verifiche di strumenti/mac-mini/prova-logica.sh passano', () => {
    const r = spawnSync('bash', ['../../strumenti/mac-mini/prova-logica.sh'], { encoding: 'utf8' });
    const out = (r.stdout ?? '') + (r.stderr ?? '');
    expect(out).toMatch(/RISULTATO: \d+ ok, 0 ko/);
  }, 180000);
});
