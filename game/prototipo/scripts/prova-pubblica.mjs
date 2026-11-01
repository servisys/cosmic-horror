// Prova della logica di pubblicazione (pubblica.mjs) senza rete e senza Azure: clone finto, sito di prova finto (server locale), token finto, deploy finto.
// Uso: npm run prova-pubblica     (esce con codice 0 solo se tutte le verifiche passano)
import { execFileSync, spawn } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cartellaCopia, potaCopie } from './pubblica-logica.mjs';

const script = join(fileURLToPath(new URL('.', import.meta.url)), 'pubblica.mjs');
const T = mkdtempSync(join(tmpdir(), 'ct-prova-pubblica-'));
const clone = join(T, 'clone');
mkdirSync(clone);
const git = (...a) => execFileSync('git', ['-C', clone, ...a], { encoding: 'utf8' }).trim();
git('init', '-q');
git('config', 'user.email', 't@t');
git('config', 'user.name', 't');
writeFileSync(join(clone, 'a.txt'), 'a');
git('add', '-A');
git('commit', '-q', '-m', 'uno');
const commit = git('rev-parse', 'HEAD');

let risposta = { ambiente: 'prova', commit };
const server = createServer((req, res) => {
  if (req.url === '/versione.json') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(risposta)); } else { res.statusCode = 404; res.end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}`;

const TOKEN_FINTO = 'TOKEN-FINTO-PRODUZIONE-123';
const finto = join(T, 'deploy-finto.txt');
const pulito = { ...process.env };
for (const k of Object.keys(pulito)) if (/^SWA_/.test(k)) delete pulito[k];
// asincrono: il sito di prova finto gira in questo stesso processo e deve poter rispondere mentre pubblica.mjs lavora
const lancia = (args, extra = {}) => new Promise((fine) => {
  const f = spawn('node', [script, ...args], { env: { ...pulito, CT_RADICE_CLONE: clone, CT_URL_PROVA: url, CT_SWA_FINTO: finto, ...extra } });
  let out = '';
  f.stdout.on('data', (d) => { out += d; });
  f.stderr.on('data', (d) => { out += d; });
  f.on('close', (codice) => fine({ codice, out }));
});
const deployFatti = () => (existsSync(finto) ? readFileSync(finto, 'utf8').split('\n').filter(Boolean) : []);

let ok = 0, ko = 0;
const verifica = (nome, vero, dettaglio = '') => { if (vero) { ok++; console.log(`OK  ${nome}`); } else { ko++; console.log(`KO  ${nome} ${dettaglio}`); } };

try {
  let r = await lancia([]);
  verifica('1. senza ambiente: si ferma subito (codice 2)', r.codice === 2 && /dire dove pubblicare/.test(r.out), r.out);
  r = await lancia(['qualunque']);
  verifica('2. ambiente sconosciuto: si ferma (codice 2)', r.codice === 2, r.out);
  r = await lancia(['produzione']);
  verifica('3. produzione senza token: si ferma (codice 2)', r.codice === 2 && /manca il token del sito di produzione/.test(r.out), r.out);
  r = await lancia(['produzione'], { SWA_CLI_DEPLOYMENT_TOKEN: TOKEN_FINTO });
  verifica('4. il vecchio SWA_CLI_DEPLOYMENT_TOKEN non si legge piu\'', r.codice === 2 && deployFatti().length === 0, r.out);
  r = await lancia(['prova']);
  verifica('5. prova senza token: si ferma (codice 2)', r.codice === 2 && /manca il token del sito di prova/.test(r.out), r.out);
  r = await lancia(['produzione'], { SWA_DEPLOYMENT_TOKEN_PROVA: TOKEN_FINTO });
  verifica('6. il token di prova non vale per la produzione', r.codice === 2, r.out);

  // file del token con permessi troppo larghi (solo dove i permessi esistono)
  const fileToken = join(clone, '.swa-token-produzione');
  writeFileSync(fileToken, TOKEN_FINTO + '\n');
  if (process.platform !== 'win32') {
    chmodSync(fileToken, 0o644);
    r = await lancia(['produzione']);
    verifica('7. file del token leggibile da altri: si ferma e dice chmod 600', r.codice === 2 && /chmod 600/.test(r.out), r.out);
    chmodSync(fileToken, 0o600);
  }

  // produzione: il commit non e' in prova
  r = await lancia(['produzione']);
  verifica('8. commit non pubblicato in prova: rifiutato (codice 3), niente deploy', r.codice === 3 && /non risulta pubblicato in prova/.test(r.out) && deployFatti().length === 0, r.out);

  // copia della build di prova presente
  const copia = cartellaCopia(clone, commit);
  mkdirSync(copia, { recursive: true });
  writeFileSync(join(copia, 'index.html'), '<html></html>');
  writeFileSync(join(copia, 'versione.json'), JSON.stringify({ ambiente: 'prova', commit }));

  risposta = { ambiente: 'prova', commit: 'f'.repeat(40) };
  r = await lancia(['produzione']);
  verifica('9. il sito di prova risponde con un altro commit: rifiutato (codice 3)', r.codice === 3 && /risponde con il commit fffffff/.test(r.out) && deployFatti().length === 0, r.out);

  risposta = { ambiente: 'prova', commit };
  r = await lancia(['produzione'], { CT_URL_PROVA: 'https://SEGNAPOSTO-prova.azurestaticapps.net' });
  verifica('10. indirizzo di prova ancora segnaposto: rifiutato (codice 3)', r.codice === 3 && /segnaposto/.test(r.out), r.out);

  r = await lancia(['produzione', '--prova']);
  verifica('11. produzione --prova: controlli ok, niente deploy', r.codice === 0 && deployFatti().length === 0, r.out);

  r = await lancia(['produzione']);
  verifica('12. produzione con commit in prova (token da file): pubblica', r.codice === 0 && deployFatti().length === 1 && /produzione token=si/.test(deployFatti()[0]), r.out);
  verifica('13. il token non compare nell\'output ne\' nel deploy annotato', !r.out.includes(TOKEN_FINTO) && !readFileSync(finto, 'utf8').includes(TOKEN_FINTO));
  verifica('14. la copia di prova resta com\'era (non ricostruita, ambiente prova)', JSON.parse(readFileSync(join(copia, 'versione.json'), 'utf8')).ambiente === 'prova');

  r = await lancia(['produzione'], { SWA_DEPLOYMENT_TOKEN_PRODUZIONE: 'altro-token-finto' });
  verifica('15. token da variabile: vale (e ha la precedenza sul file)', r.codice === 0 && deployFatti().length === 2, r.out);

  // copie: se ne tengono 10
  for (let i = 0; i < 12; i++) {
    const nome = String(i).padStart(2, '0').repeat(20);
    const d = join(clone, '.pubblicati', nome);
    mkdirSync(d, { recursive: true });
    const t = new Date(Date.now() - (100 - i) * 60000);
    utimesSync(d, t, t);
  }
  const tolte = potaCopie(clone, 10);
  verifica('16. potatura: restano 10 copie, via le piu\' vecchie', tolte.length === 3 && tolte.includes('00'.repeat(20)) && !tolte.includes(commit), JSON.stringify(tolte));
} finally {
  server.close();
  rmSync(T, { recursive: true, force: true });
}
console.log(`RISULTATO: ${ok} ok, ${ko} ko`);
process.exit(ko === 0 ? 0 : 1);
