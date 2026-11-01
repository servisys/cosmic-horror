---
id: CT-FEAT-002
fase: esecuzione
pronto: si
branch: feature/ct-feat-001-cinque-territori
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-FEAT-002 — Cinque territori, seconda parte: computer, interfaccia, simulazioni, build

## Documenti autorevoli
- Sul branch `feature/ct-feat-001-cinque-territori` (PR 72, aperta, non fusa): `CT_CORE_RULES_V0.13.md` (APPROVED; Matteo ha confermato in chat il 2026-11-01 le interpretazioni 26-28 del §13), `CT_CARTE_PROTOTIPO_V0.7.yaml`, `CT_PROTOTYPE_SCOPE_V0.3.md` (APPROVED), Decision Log `CT_DECISION_LOG_CT_DES_069_073_V0.1.md` (CT-DES-069…074 REGISTRATA; CT-DES-074 = priorità del computer a 5 territori).
- `docs/00_MASTER_INDEX.md`, `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED).
- Decisione di Matteo in chat a Cowork il 2026-11-01: la PR 72 non si fonde da sola; questo lavoro si fa sopra di lei e poi si fonde tutto insieme, così `main` resta sempre giocabile.

## Via di Matteo e risposte al pre-flight plan
Matteo ha dato il via all'esecuzione in chat a Cowork il 2026-11-01 («sì») con queste risposte:
1. Opzione A: stesso branch `feature/ct-feat-001-cinque-territori`, PR 72 unica.
2. Decision Log: `status: DRAFT` in testa con voci REGISTRATA va bene (convenzione del progetto).
3. Targhetta «ULTIMA TAPPA» sempre visibile: spenta sotto le 2 tappe, accesa e pulsante da 2 in su.
4. Segnaposto: per i territori T4 e T5 usa le loro scene 3D (`dunwich_v2`, `rlyeh_v2`); per le carte T4r e T5r un segnaposto generico con il nome della carta.
5. Pietre ritte del computer: a parità, il territorio con indice più basso, sempre dopo le priorità della tabella CT-DES-074.
Segui il pre-flight plan; ogni interpretazione della tabella CT-DES-074 va elencata nel resoconto.

## Obiettivo
Completare il gioco a 5 territori: computer secondo CT-DES-074, interfaccia con 5 quadri giocabili, simulazioni complete, controlli verdi, build.

## Scope incluso
1. **Computer** (`computer.ts`): tabella CT-DES-074, uso di Pietre ritte, Pietra Incisa (scelta del segno) e Idolo di Cthulhu; nessun id o indice di territorio scritto nel codice.
2. **Interfaccia:** `config-plancia.ts` con Dunwich (T4) e R'lyeh (T5) in gioco; R'lyeh deve far capire subito che è il luogo dell'ultima tappa (per esempio targhetta «ULTIMA TAPPA», consiglio, scena); bottone per Pietre ritte (con la scelta del territorio e del segno); scelta del segno per la Pietra Incisa; Dunwich e R'lyeh non più «non in gioco» in `main.ts` e `scena-territorio.ts`; testi di tutorial, consigli e regole in-game aggiornati (per esempio «tre Sigilli» in `scena.ts`: due fuori e l'ultimo a R'lyeh).
3. **Segnaposto** coerente per le illustrazioni mancanti (T4, T5, T4r, T5r), da sostituire quando arriveranno le immagini.
4. **Controlli:** `npm run tipi`, `npm test`, `npm run build`, `npm run leggibilita` e `npm run sovrapposizioni` a 5 quadri (956x440, 844x390, 740x340), le verifiche Playwright esistenti e una nuova `verifica-cinque-territori` (R'lyeh ultima tappa, Pietre ritte, una partita completa vinta a 5 territori dall'interfaccia). I permessi ora consentono `npm run tipi/simula/leggibilita/sovrapposizioni` e il browser di Playwright è installato. Se un controllo scrive file nel repository, non committarli salvo che siano già tracciati.
5. **Simulazioni:** `npm run simula` 1000 partite (semi 0-999): vittorie per fazione, giri medi e mediana, oltre 15 giri, senza vincitore, uso di Pietre ritte / Pietra Incisa / Idolo, Cthulhu si agita, Orrore di Dunwich; tabella di confronto con 3 territori (main) e con la PR 1 (computer non adattato: 925/75/0, 5,75 giri). Segnala squilibri con numeri e proposte, **senza correggerli da solo**.
6. **Build** in `scambio/da-claude/tappa5/dist/` con `ELENCO_FILE.txt`, provata anche da sottocartella con CSP.
7. **Branch e PR:** proponi nel piano se lavorare **sullo stesso branch** della PR 72 (che così cresce e resta una PR sola da fondere) oppure su un branch nuovo creato da quello con una PR che punta a quel branch; spiega pro e contro. Aggiorna la descrizione della PR in italiano.

## Fuori scope
- Fusioni o chiusure di PR (tramite Cowork in un task dedicato).
- Cambiare regole, carte, numeri o decisioni; nuove illustrazioni.
- Correggere il bilanciamento.

## Vincoli tecnici
- Push solo con `git push -u origin HEAD`, poi `git switch main`. Niente `cd` prima dei comandi, niente pipe, un comando git alla volta.
- Dati letti dai file (CT-DES-018).

## Criteri di accettazione
- Partita completa a 5 territori giocabile e vincibile dall'interfaccia (verifica Playwright).
- Tipi, test, build, leggibilità e sovrapposizioni verdi.
- Simulazioni in tabella con il confronto.

## Test obbligatori
- Quelli del punto 4; `git diff --stat` nel resoconto.

## Output richiesto
- Fase `piano`: pre-flight plan con la scelta del punto 7, file toccati, come si fa capire R'lyeh «ultima tappa», come funziona il bottone Pietre ritte sul telefono, rischi, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR, risultati, screenshot in `scambio/da-claude/cinque-territori/`, cosa non è stato verificato.
