// Lettura dei file dati: unica fonte sono i YAML in docs/03-cards-content/01-card-database/ (CT-DES-018).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import type { Dati } from './tipi.js';

const QUI = dirname(fileURLToPath(import.meta.url));
export const CARTELLA_DATI_PREDEFINITA = join(QUI, '..', '..', '..', '..', 'docs', '03-cards-content', '01-card-database');

/** Trova il file con la versione piu' alta (CT_<PREFISSO>_V0.x.yaml). */
export function fileConVersionePiuAlta(cartella: string, prefisso: string): string {
  const re = new RegExp(`^${prefisso}_V([0-9]+)[.]([0-9]+)[.]yaml$`);
  const trovati = readdirSync(cartella)
    .map((nome) => ({ nome, m: re.exec(nome) }))
    .filter((x) => x.m)
    .map((x) => ({ nome: x.nome, v: [Number(x.m![1]), Number(x.m![2])] }))
    .sort((a, b) => a.v[0] - b.v[0] || a.v[1] - b.v[1]);
  if (!trovati.length) throw new Error(`Nessun file ${prefisso}_V*.yaml in ${cartella}`);
  return join(cartella, trovati[trovati.length - 1].nome);
}

export function leggiYaml(file: string): any {
  return parse(readFileSync(file, 'utf-8')); // YAML 1.2 rigoroso: un file non valido lancia un errore
}

export function caricaDati(cartella: string = CARTELLA_DATI_PREDEFINITA): Dati {
  const fileCarte = fileConVersionePiuAlta(cartella, 'CT_CARTE_PROTOTIPO');
  const fileEventi = fileConVersionePiuAlta(cartella, 'CT_EVENTI_COSMICI_PROTOTIPO');
  const carte = leggiYaml(fileCarte);
  const eventi = leggiYaml(fileEventi);
  return { fileCarte, fileEventi, fazioni: carte.fazioni, territori: carte.territori, eventi: eventi.eventi };
}
