// Pubblica il gioco su Azure Static Web Apps, in uno dei due siti: «prova» o «produzione». L'ambiente va sempre detto (nessun valore predefinito).
//  - prova:      controllo dei tipi, test, build, deploy di dist; poi tiene una copia della build in .pubblicati/<commit> (le ultime 10).
//  - produzione: NON ricostruisce: pubblica la copia della build di prova di quel commit, ma solo se quel commit e' gia' in prova e il sito di prova
//                risponde proprio con quel commit; altrimenti si ferma con un messaggio.
// Il token e' uno per sito: variabile SWA_DEPLOYMENT_TOKEN_PROVA / SWA_DEPLOYMENT_TOKEN_PRODUZIONE oppure file .swa-token-prova / .swa-token-produzione
// nella radice del clone (permessi 600, in .gitignore). Non si passa mai sulla riga di comando (solo nell'ambiente del processo di deploy) e se compare
// nell'output viene coperto. Il vecchio SWA_CLI_DEPLOYMENT_TOKEN non si legge piu'.
// Uso: npm run pubblica -- prova | produzione     (aggiungi --prova per fare solo controlli e build, senza pubblicare)
import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cartellaCopia, controllaProduzione, leggiArgomenti, leggiToken, potaCopie } from './pubblica-logica.mjs';

const radice = join(fileURLToPath(new URL('.', import.meta.url)), '..'); // game/prototipo
const radiceClone = process.env.CT_RADICE_CLONE ?? join(radice, '..', '..'); // radice del clone (CT_RADICE_CLONE solo per le prove)
const SWA_CLI = '@azure/static-web-apps-cli@2.1.0';

const args = leggiArgomenti(process.argv.slice(2));
if (args.errore) { console.error(args.errore); process.exit(2); }
const { ambiente, dry } = args;

let token = '';
if (!dry) {
  const t = leggiToken(ambiente, process.env, radiceClone);
  if (t.errore) { console.error(t.errore); process.exit(2); }
  token = t.token;
}
const copri = (t) => (token ? t.split(token).join('***') : t);

// l'ambiente dei processi figli non contiene mai token: nel deploy si aggiunge solo quello del sito scelto
const ambienteBase = { ...process.env };
for (const k of Object.keys(ambienteBase)) if (/^SWA_(CLI_)?DEPLOYMENT_TOKEN/.test(k)) delete ambienteBase[k];

function esegui(titolo, comando, args, env = ambienteBase) {
  console.log(`\n=== ${titolo} ===`);
  return new Promise((ok, no) => {
    const f = spawn(comando, args, { cwd: radice, env, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
    f.stdout.on('data', (d) => process.stdout.write(copri(String(d))));
    f.stderr.on('data', (d) => process.stderr.write(copri(String(d))));
    f.on('error', no);
    f.on('close', (c) => (c === 0 ? ok() : no(new Error(`${titolo}: uscito con codice ${c}`))));
  });
}

async function deploy(cartella) {
  const titolo = `Pubblicazione su Azure Static Web Apps (${ambiente})`;
  if (process.env.CT_SWA_FINTO) { // solo per le prove: niente rete, si annota cosa sarebbe partito
    console.log(`\n=== ${titolo} (FINTO) ===`);
    appendFileSync(process.env.CT_SWA_FINTO, `deploy ${cartella} ${ambiente} token=${token ? 'si' : 'no'}\n`);
    return;
  }
  // ogni sito ha il suo ambiente «production» (quello principale della sua Static Web App): il token decide quale sito
  await esegui(titolo, 'npx', ['--yes', SWA_CLI, 'deploy', cartella, '--env', 'production', '--swa-config-location', cartella],
    { ...ambienteBase, SWA_CLI_DEPLOYMENT_TOKEN: token });
}

const scriviVersione = (cartella, commit, extra = {}) =>
  writeFileSync(join(cartella, 'versione.json'), JSON.stringify({ ambiente, commit, data: new Date().toISOString(), ...extra }, null, 2) + '\n');

try {
  const commit = execFileSync('git', ['-C', radiceClone, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (ambiente === 'prova') {
    await esegui('Controllo dei tipi', 'npm', ['run', 'tipi']);
    await esegui('Test', 'npm', ['test']);
    await esegui('Build', 'npm', ['run', 'build']);
    const dist = join(radice, 'dist');
    if (!existsSync(join(dist, 'index.html'))) throw new Error('la build non ha prodotto dist/index.html');
    scriviVersione(dist, commit);
    if (dry) {
      console.log('\nPROVA RIUSCITA: controlli e build ok, niente pubblicato (--prova).');
    } else {
      await deploy(dist);
      // copia della build, per pubblicare in produzione lo stesso commit senza ricostruirlo
      const copia = cartellaCopia(radiceClone, commit);
      rmSync(copia, { recursive: true, force: true });
      cpSync(dist, copia, { recursive: true });
      const tolte = potaCopie(radiceClone);
      console.log(`\nCopia della build salvata in ${copia}${tolte.length ? ` (tolte ${tolte.length} copie vecchie)` : ''}.`);
      console.log('\nPUBBLICATO in prova.');
    }
  } else {
    const urlProva = process.env.CT_URL_PROVA ?? JSON.parse(readFileSync(join(radice, 'siti-pubblicazione.json'), 'utf8')).prova;
    console.log(`Produzione: si pubblica il commit ${commit.slice(0, 7)} come gia' in prova, senza ricostruire.`);
    const c = await controllaProduzione({ commit, radiceClone, urlProva });
    if (c.errore) { console.error(c.errore); process.exit(3); }
    if (dry) {
      console.log('\nPROVA RIUSCITA: il commit e\' in prova e il sito di prova risponde con quel commit; niente pubblicato (--prova).');
    } else {
      // stessa build di prova, solo versione.json cambia ambiente: la build non si tocca
      const tmp = mkdtempSync(join(tmpdir(), 'ct-produzione-'));
      try {
        cpSync(c.cartella, tmp, { recursive: true });
        scriviVersione(tmp, commit, { daProva: true });
        await deploy(tmp);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
      console.log('\nPUBBLICATO in produzione.');
    }
  }
} catch (e) {
  console.error(`\nPUBBLICAZIONE FALLITA: ${copri(String(e.message ?? e))}`);
  process.exit(1);
}
