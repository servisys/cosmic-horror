---
name: scambio-copilot
description: Porta su GitHub i documenti preparati da Copilot e rimette su SharePoint le copie da far leggere a Copilot. Usare quando Matteo dice "c'è roba nuova in da-copilot", "scambio-copilot" o chiede di passare materiale tra Copilot e GitHub.
---

# Scambio Copilot ↔ GitHub (Cosmic Horror)

Procedura per fare da "postino" tra Copilot (Microsoft 365, vede solo SharePoint) e il repository GitHub privato `servisys/cosmic-horror`.

**GitHub è l'unica fonte di verità.** SharePoint contiene solo copie temporanee: non è un archivio alternativo.

## Dove

Cartella SharePoint: `L3 › Documenti condivisi › IA › Cosmic Horror › _Scambio`

- `da-copilot/` — qui Matteo (o Copilot) salva le proposte. Si legge, non si scrive.
- `da-claude/` — qui si mettono le copie per Copilot. Si scrive solo qui.

Percorso per `read_resource`: `file:///<driveId>/IA/Cosmic Horror/_Scambio/da-copilot`. Il `driveId` si ricava con `sharepoint_folder_search` (nome "_Scambio"); ultimo noto: `b!OpqirNFIsUW5IWrXe98sTZbEEVTzDUVNsCod6YJ0zHFC_BXag0t2QIWlmYCDUaMm`. Se i percorsi non rispondono, cercare di nuovo per nome: la cartella potrebbe essere stata rinominata o spostata.

Richiede il connettore Microsoft 365 nella sessione. Se non c'è, dirlo a Matteo e fermarsi.

## Regole non negoziabili

1. Nessun merge su `main`, mai. Il merge è di Matteo.
2. Non modificare, spostare o cancellare nulla su SharePoint fuori da `_Scambio/da-claude`. In `da-copilot` si legge soltanto.
3. Non sovrascrivere file su SharePoint (`conflictBehavior: fail`). Se il nome esiste, proporre un nome con versione (`_V0.2`, `_V0.3`) e chiedere conferma.
4. Non prendere decisioni di design, lore, economia o scope: segnalare e chiedere (Master Index §1).
5. Nessun segreto, nessun testo con copyright non verificato (in particolare `reference/literature/`).
6. Un file per volta ha un limite di 1 MB per il caricamento su SharePoint.

## Da SharePoint a GitHub

1. **Elenca** `da-copilot/` e individua i file nuovi o modificati. Dire a Matteo quali sono prima di procedere.
2. **Leggi** ogni file. Se il formato non è leggibile (non Markdown/testo), segnalarlo.
3. **Controlla** ciascun file:
   - [ ] front matter coerente con il modello del Master Index §7 (`title`, `status`, `version`, `owner`, `last_reviewed`);
   - [ ] `status` non è `APPROVED` (l'approvazione avviene solo col merge umano);
   - [ ] nessuna decisione presentata come presa: le scelte aperte restano **DA DECIDERE**;
   - [ ] nessuna regola, creatura o canone inventato e presentato come approvato;
   - [ ] nessun materiale protetto da copyright, nessun segreto;
   - [ ] nome progetto: **Cosmic Horror**; prefisso documenti `CT_` invariato.
4. **Scegli la destinazione** nel repo seguendo la struttura di `docs/` e il Master Index (es. Vision → `docs/00-project-overview/01-vision-concept/`). Se la destinazione non è ovvia, chiedere a Matteo.
5. **Branch** da `origin/main` aggiornato: `planning/<id>-descrizione` (documenti di planning). Non usare branch esistenti di altre PR.
6. **Commit** dei file senza alterarne il contenuto (correzioni editoriali solo se Matteo le chiede). Messaggio chiaro; aggiungere le righe di attribuzione richieste dalla sessione.
7. **PR verso `main`** seguendo il Master Index §11: titolo con ID, corpo con *documenti autorevoli*, *cosa cambia*, *test/controlli eseguiti*, *deviazioni* (nessuna, se nessuna). Controllare se esiste un template di PR e rispettarlo.
8. **Confronto**: se il materiale risponde a una mia review, scrivere a Matteo un confronto breve (dove concordo, dove no, cosa manca), distinguendo i fatti dalle opinioni. Segnalare quando le raccomandazioni di Copilot orientano le decisioni di Matteo.
9. **Non fondere nulla.** Dire a Matteo che la PR è pronta per la sua review.

## Da GitHub a SharePoint

1. Individua i documenti da far leggere a Copilot (di solito: review e documenti approvati o in review). Chiedere a Matteo se non è chiaro.
2. Per ciascuno, crea in `da-claude/` una copia con in testa questo avviso:

   > **COPIA DI SOLA LETTURA** — la fonte autorevole è GitHub: `servisys/cosmic-horror`, PR/branch `<…>`, commit `<sha>`. Generata il `<data>`. Non modificare questo file: le proposte di Copilot vanno salvate in `_Scambio/da-copilot/`.

3. Usare lo stesso nome del file nel repo. Non esportare `reference/` né file sopra 1 MB.
4. Riportare a Matteo i link ai file caricati.

## Resoconto finale (breve)

- file letti da `da-copilot` e dove sono finiti su GitHub (branch, PR);
- file copiati in `da-claude`;
- anomalie o decisioni che servono a Matteo;
- conferma esplicita: nessun merge, nulla modificato fuori da `da-claude`;
- **la frase pronta da incollare a Copilot** per il passo successivo (in un blocco di citazione, con il percorso SharePoint dei file da leggere, il compito, le regole e i nomi dei file da salvare in `da-copilot`). Matteo la vuole sempre: se non c'è un passo successivo per Copilot, dirlo.

## Se qualcosa non torna

Fermarsi e chiedere a Matteo: permessi mancanti, cartelle spostate, file illeggibili, contenuti che sembrano decisioni o regole inventate, dubbi sul copyright.
