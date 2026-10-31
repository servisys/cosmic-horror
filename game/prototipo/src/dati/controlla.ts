// Controllo dei dati da riga di comando: npm run controllo-dati
import { caricaDati } from './caricamento.js';
import { controllaDati } from './controllo.js';

const d = caricaDati();
const r = controllaDati(d);
console.log(`Carte:   ${d.fileCarte}\nEventi:  ${d.fileEventi}`);
for (const a of r.avvisi) console.log('AVVISO:', a);
for (const x of r.errori) console.log('ERRORE:', x);
console.log(`${r.errori.length} errori, ${r.avvisi.length} avvisi`);
process.exit(r.errori.length ? 1 : 0);
