# Log di sessione - percorso TypeScript web (CT-TECH-001)

Tempi in UTC, ISO 8601, misurati con l'orologio del sistema (`date -u`) durante le sessioni. Il tempo include il lavoro di scrittura di Claude. Fixture condivisa (non conta nel timebox): 2026-10-29T22:00:58Z - 22:01:17Z.

| Sessione | Inizio | Fine | Durata | Attivita' | Commit |
|---|---|---|---|---|---|
| W1 | 2026-10-29T22:01:17Z | 2026-10-29T22:04:20Z | 3 min 03 s | Progetto Vite/TypeScript, logica separata, test Vitest, UI PixiJS, elemento 3D three.js, build, screenshot automatici, controllo visivo, commit | 6c836ef (prima versione) |
| W2 | 2026-10-29T22:11:57Z | 2026-10-29T22:12:38Z | 41 s | Modifica comparativa (secondo stato): logica, UI, test; ricompilazione e screenshot | (commit finale del branch) |
| W3 | 2026-10-29T22:14:20Z | 2026-10-29T22:14:30Z | 10 s | Ripetizione della procedura da pulito (npm ci, build, test) | (commit finale del branch) |

**Totale cumulativo registrato: 3 min 54 s** (limite: 4 ore).
Pause: nessuna.

Nota: sono tempi di orologio di un agente software, non ore di lavoro umano; non sono confrontabili con stime di tempo umano.

## Correzione di sola scala (orizzontale su telefono) - richiesta di Matteo dopo la prova sull'iPhone
| Sessione | Durata | Attivita' | File toccati |
|---|---|---|---|
| W4 | 0 min 31 s | Scala dei testi e dell'elemento 3D in base all'altezza dello schermo (solo orizzontale, minimo 11 px); formato 956x440 aggiunto agli screenshot automatici; test, build, screenshot, ripubblicazione della pagina privata | `web/src/ui/main.ts`, `web/scripts/screenshots.mjs` (nessuna modifica a logica, fixture, contenuti) |
Tentativi: 1. Errori: 0. Regressioni: 0 (5 test su 5; screenshot PC e verticale invariati e verificati dalla cattura automatica). Il tempo include la sola cattura automatica, non la prova sul telefono reale.
