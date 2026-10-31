// Lettura dei file dati da disco (Node): unica fonte sono i YAML in docs/03-cards-content/01-card-database/ (CT-DES-018).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { datiDaTesti, versionePiuAlta } from './leggi.js';
import type { Dati } from './tipi.js';

const QUI = dirname(fileURLToPath(import.meta.url));
export const CARTELLA_DATI_PREDEFINITA = join(QUI, '..', '..', '..', '..', 'docs', '03-cards-content', '01-card-database');

/** Trova il file con la versione piu' alta (CT_<PREFISSO>_V0.x.yaml). */
export function fileConVersionePiuAlta(cartella: string, prefisso: string): string {
  return join(cartella, versionePiuAlta(readdirSync(cartella), prefisso));
}

export function caricaDati(cartella: string = CARTELLA_DATI_PREDEFINITA): Dati {
  const fileCarte = fileConVersionePiuAlta(cartella, 'CT_CARTE_PROTOTIPO');
  const fileEventi = fileConVersionePiuAlta(cartella, 'CT_EVENTI_COSMICI_PROTOTIPO');
  return datiDaTesti(fileCarte, readFileSync(fileCarte, 'utf-8'), fileEventi, readFileSync(fileEventi, 'utf-8'));
}
