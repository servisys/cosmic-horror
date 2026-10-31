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

const BARRA = String.fromCharCode(92);

/**
 * I file dati vanno a capo nelle stringhe tra virgolette con una barra rovesciata e una riga di continuazione indentata
 * meno del contenitore: PyYAML lo accetta, un lettore YAML 1.2 rigoroso (come questa libreria) no. Per non toccare i file,
 * il caricamento riunisce queste righe: "barra, a capo, spazi, barra, spazio" diventa uno spazio (lo stesso testo che
 * legge PyYAML). Il controllo dei dati segnala quante volte e' successo.
 */
export function normalizzaAcapo(testo: string): { testo: string; sostituzioni: number } {
  const re = new RegExp(BARRA + BARRA + '\\r?\\n[ \\t]*' + BARRA + BARRA + ' ', 'g');
  let sostituzioni = 0;
  const out = testo.replace(re, () => {
    sostituzioni++;
    return ' ';
  });
  return { testo: out, sostituzioni };
}

export function leggiYaml(file: string): { dati: any; sostituzioni: number } {
  const n = normalizzaAcapo(readFileSync(file, 'utf-8'));
  return { dati: parse(n.testo), sostituzioni: n.sostituzioni };
}

export function caricaDati(cartella: string = CARTELLA_DATI_PREDEFINITA): Dati {
  const fileCarte = fileConVersionePiuAlta(cartella, 'CT_CARTE_PROTOTIPO');
  const fileEventi = fileConVersionePiuAlta(cartella, 'CT_EVENTI_COSMICI_PROTOTIPO');
  const carte = leggiYaml(fileCarte);
  const eventi = leggiYaml(fileEventi);
  return {
    fileCarte, fileEventi, fazioni: carte.dati.fazioni, territori: carte.dati.territori, eventi: eventi.dati.eventi,
    acapoNormalizzati: { carte: carte.sostituzioni, eventi: eventi.sostituzioni },
  };
}
