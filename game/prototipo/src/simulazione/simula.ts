// Partite computer contro computer. Uso: npx tsx src/simulazione/simula.ts [numero_partite=1000] [seme_iniziale=0] [--json]
// Riporta vittorie per fazione, durata, vantaggio di chi inizia, esposizione finale e gli stessi indicatori del simulatore di Cowork.
import { caricaDati } from '../dati/caricamento.js';
import { controllaDati } from '../dati/controllo.js';
import { creaCatalogo } from '../motore/catalogo.js';
import { giocaComputerControComputer } from './partita.js';

const arg = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const N = Number(arg[0] ?? 1000);
const SEME0 = Number(arg[1] ?? 0);
const json = process.argv.includes('--json');

const dati = caricaDati();
const controllo = controllaDati(dati);
if (controllo.errori.length) {
  console.error('Dati non validi:\n' + controllo.errori.join('\n'));
  process.exit(1);
}
const cat = creaCatalogo(dati);
const vittorie: Record<string, number> = { custodi: 0, risvegliati: 0, nessuno: 0 };
const giri: number[] = [];
const inizia: Record<string, number> = {};
const somme: Record<string, number[]> = {};
const aggiungi = (k: string, v: number) => (somme[k] ??= []).push(v);
const t0 = Date.now();

for (let i = 0; i < N; i++) {
  const g = giocaComputerControComputer(cat, { seme: SEME0 + i });
  const s = g.s;
  const vince = s.vincitore === null ? 'nessuno' : s.giocatori[s.vincitore].fazione;
  vittorie[vince]++;
  giri.push(Math.min(s.giro, s.maxGiri));
  const k = `${s.giocatori[0].fazione} -> ${vince}`;
  inizia[k] = (inizia[k] ?? 0) + 1;
  aggiungi(`inst fine (media dei ${s.territori.length} territori)`, s.territori.reduce((a, t) => a + t.inst, 0) / s.territori.length);
  aggiungi('Pietre ritte usate (totale)', s.cronaca.filter((l) => /usa le Pietre ritte/.test(l)).length);
  aggiungi('Pietra Incisa giocata (totale)', s.cronaca.filter((l) => / gioca Pietra Incisa$/.test(l)).length);
  aggiungi('Idolo di Cthulhu giocato (totale)', s.cronaca.filter((l) => / gioca Idolo di Cthulhu$/.test(l)).length);
  aggiungi('Cthulhu si agita (volte)', s.cronaca.filter((l) => /^Cthulhu si agita/.test(l)).length);
  aggiungi("L'Orrore di Dunwich (presenze eliminate)", s.cronaca.filter((l) => /eliminata: L'Orrore di Dunwich \(instabilita' 5\)/.test(l)).length);
  for (const p of s.giocatori) {
    const f = p.fazione;
    const conta = (re: RegExp) => s.cronaca.filter((l) => re.test(l)).length;
    aggiungi(`${f} esposizione a fine partita`, p.esposizione);
    aggiungi(`${f} trasformazioni`, conta(new RegExp(`^${f}: una carta del mazzo si trasforma`)));
    aggiungi(`${f} tappe tolte dall'avversario`, conta(new RegExp(`^tappa di ${f} tolta`)));
    aggiungi(`${f} rimescolamenti del mazzo`, conta(new RegExp(`^${f}: mazzo finito`)));
    aggiungi(`${f} carte di riserva prese`, conta(new RegExp(`^${f}: prende una carta di riserva`)));
    aggiungi(`${f} carte giocate`, conta(new RegExp(`^${f} gioca `)));
  }
}
giri.sort((a, b) => a - b);
const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const distribuzione: Record<number, number> = {};
for (const x of giri) distribuzione[x] = (distribuzione[x] ?? 0) + 1;
const ris = {
  partite: N,
  semi: [SEME0, SEME0 + N - 1],
  secondi: (Date.now() - t0) / 1000,
  vittorie,
  giri: {
    media: media(giri), mediana: giri[Math.floor(N / 2)], min: giri[0], max: giri[N - 1],
    oltre15: giri.filter((x) => x > 15).length, interrotte_al_limite: vittorie.nessuno,
  },
  distribuzioneGiri: distribuzione,
  chiInizia_vince: inizia,
  medie: Object.fromEntries(Object.entries(somme).map(([k, v]) => [k, Number(media(v).toFixed(2))])),
};
if (json) console.log(JSON.stringify(ris, null, 1));
else {
  console.log(`Partite: ${N} (semi ${SEME0}..${SEME0 + N - 1}), ${ris.secondi.toFixed(1)} s`);
  console.log('Vittorie:', ris.vittorie);
  console.log(`Giri: media ${ris.giri.media.toFixed(2)}, mediana ${ris.giri.mediana}, min ${ris.giri.min}, max ${ris.giri.max}, oltre 15: ${ris.giri.oltre15}, interrotte al limite: ${ris.giri.interrotte_al_limite}`);
  console.log('Distribuzione dei giri:', JSON.stringify(distribuzione));
  console.log('Chi inizia -> chi vince:', ris.chiInizia_vince);
  for (const [k, v] of Object.entries(ris.medie)) console.log(`  ${k}: ${v}`);
}
