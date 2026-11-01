// Logica della pubblicazione (scelta dell'ambiente, token, controlli della produzione, copie delle build di prova), separata da pubblica.mjs per poterla provare
// senza rete e senza pubblicare (vedi prova-pubblica.mjs). Nessun segreto qui: il token si legge ma non si scrive da nessuna parte.
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const AMBIENTI = ['prova', 'produzione'];
export const COPIE_DA_TENERE = 10;

/** Argomenti: l'ambiente e' obbligatorio e non c'e' un valore predefinito. «--prova» (opzione) = solo controlli e build, senza pubblicare. */
export function leggiArgomenti(argv) {
  const dry = argv.includes('--prova');
  const posizionali = argv.filter((a) => !a.startsWith('--'));
  const ambiente = posizionali[0];
  if (!ambiente || !AMBIENTI.includes(ambiente) || posizionali.length > 1) {
    return { errore: [
      'PUBBLICAZIONE FERMATA: devi dire dove pubblicare (nessun valore predefinito).',
      'Uso: npm run pubblica -- prova          (sito di prova)',
      '     npm run pubblica -- produzione     (sito di produzione: lo stesso commit gia\' pubblicato in prova, senza ricostruirlo)',
      'Per provare solo i controlli e la build senza pubblicare, aggiungi --prova (esempio: npm run pubblica -- prova --prova).',
      ambiente ? `Ricevuto: «${posizionali.join(' ')}».` : '',
    ].filter(Boolean).join('\n') };
  }
  return { ambiente, dry };
}

/** Token del sito: variabile SWA_DEPLOYMENT_TOKEN_<AMBIENTE> oppure file .swa-token-<ambiente> nella radice del clone (permessi 600). Mai altrove. */
export function leggiToken(ambiente, env, radiceClone, piattaforma = process.platform) {
  const variabile = `SWA_DEPLOYMENT_TOKEN_${ambiente.toUpperCase()}`;
  const file = join(radiceClone, `.swa-token-${ambiente}`);
  const dallaVariabile = (env[variabile] ?? '').trim();
  if (dallaVariabile) return { token: dallaVariabile };
  if (existsSync(file)) {
    if (piattaforma !== 'win32' && (statSync(file).mode & 0o077) !== 0) {
      return { errore: `PUBBLICAZIONE FERMATA: il file ${file} e' leggibile da altri utenti. Correggi con: chmod 600 "${file}"` };
    }
    const dalFile = readFileSync(file, 'utf8').trim();
    if (dalFile) return { token: dalFile };
  }
  return { errore: [
    `PUBBLICAZIONE FERMATA: manca il token del sito di ${ambiente}.`,
    `Imposta la variabile d'ambiente ${variabile} oppure crea il file ${file} (solo il token, permessi 600, mai in chat).`,
    'Il token e\' quello della Static Web App su Azure (Panoramica, «Gestisci il token di distribuzione»). Un token diverso per ogni sito.',
    'Per provare solo i controlli e la build senza pubblicare: aggiungi --prova.',
  ].join('\n') };
}

/** Copia della build di prova per commit: cartella .pubblicati/<commit> nella radice del clone. */
export function cartellaCopia(radiceClone, commit) {
  return join(radiceClone, '.pubblicati', commit);
}

/** Si tengono le ultime «quante» copie (le piu' recenti per data di modifica). */
export function potaCopie(radiceClone, quante = COPIE_DA_TENERE) {
  const base = join(radiceClone, '.pubblicati');
  if (!existsSync(base)) return [];
  const voci = readdirSync(base)
    .filter((n) => /^[0-9a-f]{40}$/.test(n))
    .map((n) => ({ n, t: statSync(join(base, n)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  const tolte = voci.slice(quante).map((v) => v.n);
  for (const n of tolte) rmSync(join(base, n), { recursive: true, force: true });
  return tolte;
}

/** Cosa risponde il sito di prova (versione.json, pubblico apposta: ha solo ambiente e commit). */
export async function leggiVersioneOnline(url, fetchFn = fetch) {
  const r = await fetchFn(`${url.replace(/\/+$/, '')}/versione.json`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`il sito di prova ha risposto ${r.status}`);
  return r.json();
}

/**
 * Controlli prima di pubblicare in produzione. Ritorna { cartella } oppure { errore }.
 * Il commit deve avere la copia della build di prova e il sito di prova deve rispondere proprio con quel commit.
 */
export async function controllaProduzione({ commit, radiceClone, urlProva, fetchFn = fetch }) {
  const cartella = cartellaCopia(radiceClone, commit);
  const corto = commit.slice(0, 7);
  if (!existsSync(join(cartella, 'index.html')) || !existsSync(join(cartella, 'versione.json'))) {
    return { errore: [
      `PUBBLICAZIONE FERMATA: il commit ${corto} non risulta pubblicato in prova (manca la copia della build in ${cartella}).`,
      'In produzione va solo un commit gia\' passato dal sito di prova. Aspetta che il job del Mac lo pubblichi in prova (o lancia npm run pubblica -- prova), controlla il sito di prova e rilancia.',
      'Se vuoi un commit diverso, portati su quel commit nel clone (git checkout) e verifica che sia stato pubblicato in prova.',
    ].join('\n') };
  }
  let copia;
  try { copia = JSON.parse(readFileSync(join(cartella, 'versione.json'), 'utf8')); } catch { copia = {}; }
  if (copia.commit !== commit || copia.ambiente !== 'prova') {
    return { errore: `PUBBLICAZIONE FERMATA: la copia in ${cartella} non e' una build di prova del commit ${corto} (versione.json non coerente). Ripubblica il commit in prova.` };
  }
  if (!urlProva || /SEGNAPOSTO/i.test(urlProva)) {
    return { errore: 'PUBBLICAZIONE FERMATA: l\'indirizzo del sito di prova in game/prototipo/siti-pubblicazione.json e\' ancora un segnaposto. Mettici l\'indirizzo vero e rilancia.' };
  }
  let online;
  try { online = await leggiVersioneOnline(urlProva, fetchFn); } catch (e) {
    return { errore: `PUBBLICAZIONE FERMATA: non riesco a leggere il commit online dal sito di prova (${urlProva}): ${e.message ?? e}.` };
  }
  if (online.commit !== commit) {
    return { errore: [
      `PUBBLICAZIONE FERMATA: il sito di prova risponde con il commit ${String(online.commit ?? '?').slice(0, 7)}, non con ${corto}.`,
      'In produzione va lo stesso commit che c\'e\' ora in prova. Porta il clone su quel commit oppure aspetta che la prova si aggiorni.',
    ].join('\n') };
  }
  return { cartella };
}
