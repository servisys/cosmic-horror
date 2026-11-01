// Pubblica il gioco su Azure Static Web Apps: controllo dei tipi, test, build e deploy di dist in produzione con la CLI ufficiale.
// Il token (token di distribuzione della Static Web App) si legge SOLO dalla variabile SWA_CLI_DEPLOYMENT_TOKEN: non si scrive in nessun file,
// non si passa come argomento e se per caso compare nell'output viene coperto. Se manca ci si ferma subito con un messaggio chiaro.
// Uso: SWA_CLI_DEPLOYMENT_TOKEN=... npm run pubblica      (npm run pubblica -- --prova = solo controlli e build, senza pubblicare)
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SWA_CLI = '@azure/static-web-apps-cli@2.1.0';
const prova = process.argv.includes('--prova');
const token = process.env.SWA_CLI_DEPLOYMENT_TOKEN ?? '';

if (!prova && !token) {
  console.error([
    'PUBBLICAZIONE FERMATA: manca il token di distribuzione.',
    'Imposta la variabile d\'ambiente SWA_CLI_DEPLOYMENT_TOKEN (il token della Static Web App su Azure) e rilancia.',
    'Sul Mac mini la legge da sola dal Portachiavi (vedi la guida in docs/05-technical-design/04-build-deployment/).',
    'Per provare solo i controlli e la build senza pubblicare: npm run pubblica -- --prova',
  ].join('\n'));
  process.exit(2);
}

const copri = (t) => (token ? t.split(token).join('***') : t);

function esegui(titolo, comando, args) {
  console.log(`\n=== ${titolo} ===`);
  return new Promise((ok, no) => {
    const f = spawn(comando, args, { cwd: radice, env: process.env, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
    f.stdout.on('data', (d) => process.stdout.write(copri(String(d))));
    f.stderr.on('data', (d) => process.stderr.write(copri(String(d))));
    f.on('error', no);
    f.on('close', (c) => (c === 0 ? ok() : no(new Error(`${titolo}: uscito con codice ${c}`))));
  });
}

try {
  await esegui('Controllo dei tipi', 'npm', ['run', 'tipi']);
  await esegui('Test', 'npm', ['test']);
  await esegui('Build', 'npm', ['run', 'build']);
  if (!existsSync(join(radice, 'dist', 'index.html'))) throw new Error('la build non ha prodotto dist/index.html');
  if (prova) {
    console.log('\nPROVA RIUSCITA: controlli e build ok, niente pubblicato (--prova).');
  } else {
    // il token passa solo dall'ambiente (SWA_CLI_DEPLOYMENT_TOKEN), mai dalla riga di comando
    await esegui('Pubblicazione su Azure Static Web Apps (produzione)', 'npx', ['--yes', SWA_CLI, 'deploy', './dist', '--env', 'production', '--swa-config-location', './dist']);
    console.log('\nPUBBLICATO.');
  }
} catch (e) {
  console.error(`\nPUBBLICAZIONE FALLITA: ${copri(String(e.message ?? e))}`);
  process.exit(1);
}
