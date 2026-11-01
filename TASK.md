---
id: CT-FEAT-001
fase: esecuzione
pronto: si
branch: feature/ct-feat-001-cinque-territori
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-FEAT-001 — Il gioco a 5 territori (Dunwich e R'lyeh in gioco)

## Documenti autorevoli
- `docs/01-game-design/01-core-rules/CT_CORE_RULES_V0.12.md` (APPROVED).
- `docs/00-project-overview/02-roadmap/CT_PROTOTYPE_SCOPE_V0.2.md` (APPROVED).
- `docs/00_MASTER_INDEX.md` (APPROVED 0.6.0), `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED).
- `docs/00-project-overview/03-decisions-changelog/CT_DECISION_LOG_REGOLE_V0.2.md` (regole del Decision Log).
- Decisioni di Matteo in chat a Cowork il 2026-11-01 (testo qui sotto, da copiare nel Decision Log). Domande e risposte: vittoria «3 tappe, una a R'lyeh»; R'lyeh «Ultima tappa lì»; Dunwich «Pietre ritte»; energia «Almeno 3 su 5»; sulla tabella dei dettagli proposta da Cowork (effetti, riserve, computer): «ok procediamo con tutto».
- `docs/02-universe-lore/CT_GUIDA_DEL_MONDO_V0.1.md` (Dunwich e R'lyeh), CT-DES-061 (citazioni).

## Decisioni da registrare (nuovo file `docs/00-project-overview/03-decisions-changelog/CT_DECISION_LOG_CT_DES_069_073_V0.1.md`, `status: DRAFT`, formato come CT-DES-068)

**CT-DES-069 — Cinque territori.** Stato: REGISTRATA. Nel prototipo il campo ha 5 territori, sempre gli stessi: Innsmouth e la Scogliera del Diavolo, La Biblioteca della Miskatonic, La Landa Maledetta, Dunwich, R'lyeh (il pozzo al centro della plancia). Sostituisce CT-DES-022 e CT-DES-052.

**CT-DES-070 — Vittoria con l'ultima tappa a R'lyeh.** Stato: REGISTRATA. Gli obiettivi restano di 3 tappe (Sigilli per i Custodi, riti per i Risvegliati, alle stesse condizioni di CT-DES-055, una per territorio). Le prime due tappe si fanno su due dei quattro territori esterni; la terza, quella che fa vincere, **solo a R'lyeh**. Su R'lyeh non si può fare una tappa prima di averne due. Il segnale scatta con due tappe; il turno di avviso (CT-DES-015) e la regola delle tappe non consolidate (CT-DES-056) restano. Modifica CT-DES-055 (dove si fanno le tappe).

**CT-DES-071 — Dunwich, le pietre ritte.** Stato: REGISTRATA. Effetto di Dunwich: chi lo controlla, una volta per turno, può spendere 1 energia per alzare o abbassare di 1 l'instabilità di un altro territorio.

**CT-DES-072 — Energia extra con 3 territori.** Stato: REGISTRATA. L'energia extra dai territori (+1) si ottiene se all'inizio del turno controlli almeno 3 territori (prima 2 su 3). Numero provvisorio (CT-DES-030).

**CT-DES-073 — R'lyeh e Dunwich: effetti, effetti cosmici e riserve.** Stato: REGISTRATA (valori provvisori):
- R'lyeh, *La città dormiente*: ogni carta potente giocata qui fa salire l'esposizione di chi la gioca di 1 in più.
- R'lyeh a instabilità 5, *Cthulhu si agita*: alla fine del giro, +1 esposizione a entrambi i giocatori.
- Dunwich a instabilità 5, *L'Orrore di Dunwich*: alla fine del giro viene eliminata la presenza con forza più alta su Dunwich (a parità, tutte quelle con quella forza).
- Riserva di Dunwich (3 copie): *Pietra Incisa*, azione, costo 1, potente 0: «Instabilità di un territorio +1 o −1, a tua scelta.»
- Riserva di R'lyeh (3 copie): *Idolo di Cthulhu*, azione, costo 2, potente 1: «Una tua presenza a R'lyeh ha +2 forza fino a fine partita.»
- Priorità del computer: adattate a R'lyeh (prima delle due tappe preparare R'lyeh con presenze; con l'avversario a un passo, difendere R'lyeh). La tabella precisa la propone Code nel piano: **finché Matteo non la conferma, nel Decision Log questa parte resta PROPOSTA** (voce separata CT-DES-074 se serve).

Citazioni (CT-DES-061, tradotte da Cowork dai testi in `reference/literature/gutenberg/`; verifica che l'originale sia esatto):
- Dunwich (T4): «Gli estranei visitano Dunwich il meno possibile.» — The Dunwich Horror — "Outsiders visit Dunwich as seldom as possible"
- R'lyeh (T5): «La città-cadavere di R'lyeh, l'incubo costruito in eoni incommensurabili prima della storia.» — The Call of Cthulhu — "the nightmare corpse-city of R'lyeh, that was built in measureless eons behind history"
- Pietra Incisa (T4r): «Gli strani cerchi di alte colonne di pietra che coronano quasi tutte le colline.» — The Dunwich Horror — "the queer circles of tall stone pillars with which most of them are crowned"
- Idolo di Cthulhu (T5r): «L'idolo scolpito era il grande Cthulhu.» — The Call of Cthulhu — "The carven idol was great Cthulhu"

## Via di Matteo e risposte al pre-flight plan
Matteo ha dato il via all'esecuzione in chat a Cowork il 2026-11-01 («ok») con queste risposte:
1. **Tabella delle priorità del computer a 5 territori: confermata così com'è nel pre-flight plan.** Nel Decision Log va come **CT-DES-074, Stato: REGISTRATA** (sostituisce CT-DES-065 e CT-DES-067 per il prototipo a 5 territori), con la tabella del piano. Implementazione nel secondo task.
2. L'Orrore di Dunwich considera le presenze di entrambi i giocatori.
3. Pietre ritte: vale per chi controlla Dunwich al momento della mossa; «altro territorio» = diverso da Dunwich; non fa salire l'esposizione.
4. Se un giocatore con 2 tappe ne perde una, non può fare la tappa a R'lyeh finché non torna a 2.
   (I punti 2-4 vanno come chiarimenti nelle regole V0.13, §13.)
5. Scope del prototipo: **V0.3 APPROVED** (conseguenza della decisione registrata CT-DES-069), con modifiche minime alle sole righe sui 3 territori; V0.2 DEPRECATED con `superseded_by`.
6. **In questo task fai solo la PR 1**: Decision Log CT-DES-069…074, regole V0.13, carte V0.7, scope V0.3, Master Index (0.7.0), motore a 5 territori con effetti legati all'id, test, prima simulazione di prova per controllare che il gioco non si blocchi. Computer, interfaccia, simulazioni complete e build saranno un task successivo (CT-FEAT-002) dopo la fusione della PR 1.
Per la simulazione di prova, se `npm run simula` è bloccato, crea uno script npm `verifica-simula` che la lanci, e dichiaralo. Ricorda: niente `cd` prima dei comandi, niente pipe, un comando git alla volta.

## Obiettivo
Portare il prototipo da 3 a 5 territori secondo le decisioni sopra: documenti, dati, motore, computer, interfaccia, simulazioni.

## Scope incluso
1. Decision Log CT-DES-069…073 (e 074 PROPOSTA per il computer, se serve).
2. Regole V0.13 (V0.12 DEPRECATED): §2, §5, §6, §8, §10 e dove serve; carte V0.7 (V0.6 DEPRECATED) con T4, T5 e le riserve T4r, T5r; scope del prototipo se cita 3 territori (proponi tu come gestirlo, è APPROVED).
3. Motore: 5 territori, tappe con la regola di R'lyeh, segnale con due tappe, effetto e riserva di Dunwich e R'lyeh, effetti cosmici, energia extra con 3, eventi che colpiscono territori estesi a 5. Test per ogni regola nuova.
4. Computer: proposta della tabella delle priorità a 5 territori (nel piano), poi implementazione.
5. Interfaccia: `config-plancia.ts` con Dunwich e R'lyeh in gioco; R'lyeh deve far capire subito che è il luogo dell'ultima tappa (targhetta/scena/consiglio); tutorial, consigli e regole in-game aggiornati; leggibilità e sovrapposizioni ancora verdi con 5 quadri (956x440, 844x390, 740x340). Le 2 carte nuove senza illustrazione usano un segnaposto coerente (le illustrazioni si faranno dopo con ComfyUI).
6. Simulazioni: 1000 partite computer contro computer (semi 0-999): vittorie per fazione, durata media e mediana in giri, partite oltre 15 giri, partite senza vincitore, uso di Pietre ritte, Pietra Incisa e Idolo; confronto con la versione a 3 territori.
7. Build in `scambio/da-claude/tappa5/dist/` come le altre volte.
8. PR verso `main`, descrizione in italiano.

## Fuori scope
- Fusioni o chiusure di PR (le gestisce Matteo tramite Cowork in un task dedicato).
- Illustrazioni nuove, nuove carte oltre alle 2 riserve, modifiche alle carte esistenti.
- Cambiare il bilanciamento oltre a quanto deciso: se le simulazioni mostrano problemi (per esempio partite bloccate su R'lyeh), segnalali con numeri e proposte, non correggerli da solo.

## Vincoli tecnici
- Base `main`. Push solo con `git push -u origin HEAD`, poi `git switch main`. Nessun `node`/`npx` in fase esecuzione: usa gli script npm permessi (`npm ci`, `npm test`, `npm run build`, `npm run verifica*`); se per le simulazioni o i controlli Playwright serve uno script npm nuovo, crealo con nome `verifica-...` e dillo nel piano.
- Dati letti dai file (CT-DES-018); nessun numero scritto nel codice.
- Il lavoro è grande: nel piano proponi se dividerlo in più task/PR (per esempio documenti+dati+motore, poi computer+interfaccia+simulazioni).

## Criteri di accettazione
- Decisioni nel Decision Log con lo stato giusto; regole e carte a nuova versione coerenti con le decisioni.
- Test del motore verdi, comprese le regole nuove; controlli di leggibilità e sovrapposizioni verdi.
- Simulazioni riportate in tabella con il confronto.

## Test obbligatori
- `npm test`, `npm run build`, le verifiche esistenti; nuove verifiche per 5 territori.
- `git diff --stat` nel resoconto.

## Output richiesto
- Fase `piano`: pre-flight plan con divisione del lavoro, file toccati, **tabella delle priorità del computer a 5 territori** da far confermare a Matteo, come verranno eseguite simulazioni e Playwright con i permessi della fase esecuzione, rischi (soprattutto lo stallo su R'lyeh), domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR, risultati delle simulazioni e cosa non è stato verificato.
