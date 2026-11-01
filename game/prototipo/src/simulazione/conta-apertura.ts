// Quante volte il computer gioca Formula di Dho-Hna (RI15) e Studio del Necronomicon (CU14) e quante tappe nascono da loro (CT-DES-068).
// Una tappa «nasce» dalla carta se, nel momento in cui viene fatta, senza lo spostamento della soglia non sarebbe stata possibile.
// Uso: npx tsx src/simulazione/conta-apertura.ts [numero_partite=1000] [seme_iniziale=0]
import { sceglieMossa } from '../computer/computer.js';
import { caricaDati } from '../dati/caricamento.js';
import { creaCatalogo } from '../motore/catalogo.js';
import { applica, chiDeveMuovere, creaPartita, finita } from '../motore/motore.js';
import { tappaPosabile } from '../motore/queries.js';
import { creaVista } from '../motore/vista.js';

const N = Number(process.argv[2] ?? 1000);
const SEME0 = Number(process.argv[3] ?? 0);
const cat = creaCatalogo(caricaDati());
const ris = {
  custodi: { giocate: 0, partiteConCarta: 0, tappe: 0, tappeDaCarta: 0, vittorieConCarta: 0 },
  risvegliati: { giocate: 0, partiteConCarta: 0, tappe: 0, tappeDaCarta: 0, vittorieConCarta: 0 },
};
for (let i = 0; i < N; i++) {
  const g = creaPartita(cat, { seme: SEME0 + i });
  const usata = { custodi: 0, risvegliati: 0 };
  while (!finita(g)) {
    const io = chiDeveMuovere(g);
    const fz = g.s.giocatori[io].fazione;
    const v = creaVista(g, io);
    const m = sceglieMossa(v, cat);
    if (m.t === 'gioca') {
      const id = v.mano.find((c) => c.uid === m.carta)!.id;
      if (id === 'CU14' || id === 'RI15') { ris[fz].giocate++; usata[fz]++; }
    }
    if (m.t === 'tappa') {
      ris[fz].tappe++;
      const gi = g.s.giocatori[io];
      if (gi.aperturaTappa) {
        gi.aperturaTappa = false;
        if (!tappaPosabile(g, io, m.terr)) ris[fz].tappeDaCarta++;
        gi.aperturaTappa = true;
      }
    }
    applica(g, io, m);
  }
  const vinc = g.s.vincitore === null ? null : g.s.giocatori[g.s.vincitore].fazione;
  for (const fz of ['custodi', 'risvegliati'] as const) {
    if (usata[fz] > 0) ris[fz].partiteConCarta++;
    if (usata[fz] > 0 && vinc === fz) ris[fz].vittorieConCarta++;
  }
}
console.log(`Partite: ${N} (semi ${SEME0}..${SEME0 + N - 1})`);
console.log(JSON.stringify(ris, null, 1));
