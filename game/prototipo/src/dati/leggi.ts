// Interpretazione dei testi YAML (senza accesso ai file: usata sia da Node sia dal browser, dove i testi arrivano dalla build).
import { parse } from 'yaml';
import type { Dati } from './tipi.js';

export function datiDaTesti(fileCarte: string, testoCarte: string, fileEventi: string, testoEventi: string): Dati {
  const carte = parse(testoCarte); // YAML 1.2 rigoroso: un testo non valido lancia un errore
  const eventi = parse(testoEventi);
  return { fileCarte, fileEventi, fazioni: carte.fazioni, territori: carte.territori, eventi: eventi.eventi };
}

/** Sceglie, fra i nomi dei file, quello con la versione piu' alta: CT_<PREFISSO>_V0.x.yaml. */
export function versionePiuAlta(nomi: string[], prefisso: string): string {
  const re = new RegExp(`${prefisso}_V([0-9]+)[.]([0-9]+)[.]yaml$`);
  const t = nomi
    .map((n) => ({ n, m: re.exec(n) }))
    .filter((x) => x.m)
    .map((x) => ({ n: x.n, v: [Number(x.m![1]), Number(x.m![2])] }))
    .sort((a, b) => a.v[0] - b.v[0] || a.v[1] - b.v[1]);
  if (!t.length) throw new Error(`Nessun file ${prefisso}_V*.yaml`);
  return t[t.length - 1].n;
}
