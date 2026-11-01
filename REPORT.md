# Resoconti di Claude Code (il piu' recente in alto)

## CT-DEV-002 - fase piano - 2026-11-01 13:48 - FATTO

# Pre-flight plan CT-DEV-002 (fase piano)

## Richiesta eseguita
Letto TASK.md e i documenti indicati. Non ho modificato nulla.

## Verifiche
- `CT_COWORK_CODE_PROTOCOL_V0.2.md` è APPROVED 0.2.0. Ho letto §2.1, §3 e §8.
- `00_MASTER_INDEX.md` ha l'ultima riga del changelog «0.5.0 APPROVED». Ho letto solo `grep` su questo file. Non ne ho letto il contenuto per intero.
- Ho letto `osserva-scambio.ps1` per intero, e `LEGGIMI.md` solo da riga 40 in poi. Nella cartella `prove/` ci sono solo i test sul flusso (`controlla-prove.ps1` e i flussi di esempio). I test «sul repository finto per i permessi» citati nel task qui non ci sono.
- Il task è pronto: non ho trovato blocchi.

## Soluzione proposta per il punto 3: fa tutto lo script, a Code non si dà nessun comando
Resta come oggi: `gh pr merge` e `gh pr close` sono in `$ToolVietati` e Code non li può usare. Le fusioni e le chiusure le esegue lo script, in una funzione `Esegui-Fusioni`.

**Perché è più sicuro:**
1. Le regole sono codice fisso. Code non può ottenere un comando aperto con un `gh` sbagliato (`--admin`, `--auto`, `--squash`).
2. Lo script controlla prima di fondere. Con un permesso a Code non si potrebbe.
3. Il comando è sempre `gh pr merge N --merge --match-head-commit SHA`. Gli argomenti sono passati come array, senza stringhe di shell.

**Quando gira:** dopo l'esecuzione di Code, solo in fase `esecuzione` e solo se l'esito è FATTO. Se Code fallisce, non si fonde niente. Se mancano i campi, non cambia nulla rispetto a oggi. In fase `piano` i campi sono ignorati e il resoconto lo dice.

**Controlli per ogni fusione (gh pr view --json):**
- PR aperta e non bozza.
- Base `main`.
- `headRefOid` uguale allo sha del task (confronto sullo sha intero, 40 caratteri).
- `mergeable` = MERGEABLE. Se è UNKNOWN, ritenta 3 volte a distanza di pochi secondi, poi ferma.
- Se c'è `file_attesi`, i file toccati devono stare tutti dentro la lista. Controllo anche che il numero dei file letti sia uguale a `changedFiles`, perché il comando può troncare l'elenco sulle PR grandi. Se non torna, ferma.
- Se un controllo fallisce, la PR è «fermata» con il motivo, e le altre proseguono.
- Se la PR risulta già fusa con lo stesso sha, la riga dice «già fusa» e non è un errore. Così rilanciare con `-Riprova` è sicuro.

**Controlli per ogni chiusura:**
- PR aperta.
- Motivo non vuoto, obbligatorio.
- Il motivo non contiene `"` né backtick, perché PowerShell 5.1 li gestisce male nel passaggio dei parametri. Se li contiene, la chiusura è fermata.
- Comando: `gh pr close N --comment "<motivo>"`, senza `--delete-branch`.

**Resoconto:** lo script aggiunge una sezione «Fusioni e chiusure» con una riga per PR: fusa, chiusa, fermata o già fusa, più il motivo. Il testo viene aggiunto sotto il resoconto di Code.

## Formato dei campi
Il parser attuale (`Leggi-FrontMatter`) è piatto: una chiave per riga, e se una chiave si ripete resta l'ultima. Un YAML con liste annidate non funziona. Propongo chiavi piatte, leggibili in PowerShell 5.1 senza dipendenze:

```yaml
fusioni: 69@<sha40>, 71@<sha40>
file_attesi_69: docs/a.md, docs/b.md        # facoltativo
chiusure: 70
motivo_70: "testo del commento"             # obbligatorio per ogni chiusura
```

Il parser già toglie le virgolette. Le righe di `motivo_*` vanno lette anche con `:` dentro il testo, e la regex attuale lo consente. Uno sha non di 40 caratteri esadecimali, o un numero non valido, ferma quella PR con una riga che lo spiega.

## File toccati
- `docs/CT_COWORK_CODE_PROTOCOL_V0.3.md` (nuovo, DRAFT, con la dicitura «PROPOSTA DI COWORK, DA CONFERMARE DA MATTEO»). Cambiano solo §2.1, §3, §8 e il changelog. La V0.2 non si tocca.
- `strumenti/windows-scambio/osserva-scambio.ps1`: nuove funzioni per leggere i campi, controllare, fondere e chiudere, e per la sezione del resoconto.
- `strumenti/windows-scambio/LEGGIMI.md`: formato dei campi e come funzionano i controlli.
- `strumenti/windows-scambio/prove/`: nuovo script di prova e relativi file attesi.

## Prove proposte
- Introduco `Invoke-Gh`, un unico punto da cui passano le chiamate a `gh`. Con `-GhFinto <cartella>` lo script legge i dati delle PR da file JSON e salta merge e close reali (esegue solo i controlli e registra la decisione).
- Aggiungo `-ProvaFusioni <TASK.md>` per simulare tutto senza lanciare Code.
- Il nuovo script `prove\controlla-fusioni.ps1` copre questi casi:
  - fusione ok;
  - sha diverso;
  - PR non elencata;
  - base non `main`;
  - conflitti;
  - file fuori da `file_attesi`;
  - chiusura senza motivo;
  - campi assenti (nessun cambiamento);
  - fase `piano`.
- In esecuzione lancio `git diff --stat` e tutte le prove. Nessuna fusione o chiusura reale viene eseguita su GitHub, e lo scriverò nel resoconto.
- La prova con `gh` vero su una PR di test resta da fare a Matteo o a Code interattivo dopo l'installazione. Il comando sarà indicato nel resoconto.

## Rischi residui
1. **Chi scrive su `scambio` comanda le fusioni.** Lo script non può sapere se un `TASK.md` l'ha scritto davvero Cowork dopo un sì di Matteo. Chi ha il permesso di scrittura su quel branch (o un account compromesso) può farle partire. Le protezioni sono lo sha fisso, la lista di file e `main`. Il ruleset di `main` resta la difesa vera, ma è fuori scope.
2. **Lo sha protegge dalla testa cambiata, non dal contenuto.** Se Cowork scrive uno sha sbagliato o già vecchio, la PR si ferma (bene). Se lo sha è giusto ma il contenuto non è quello che Matteo ha visto, passa.
3. **Fusione senza controlli CI.** Il task non li chiede. Vedi domanda 2.
4. **`mergeable` di GitHub a volte è UNKNOWN.** Mitigato col ritentare, ma una fusione può essere fermata e dover essere rilanciata.
5. **Elenco file troncato sulle PR grandi.** Mitigato col controllo su `changedFiles`.
6. **Il testo di `RegoleComuni` dice che le fusioni le autorizza solo Matteo in sessione interattiva.** Resta vero per Code: la delega passa dallo script, non da Code. Propongo di non toccarlo, e di chiarirlo nella V0.3.
7. **Doppia esecuzione.** Lo script segna già il `TASK.md` come eseguito per hash del file. Un task con `-Riprova` ripete le fusioni, ma «già fusa» le rende innocue.

## Domande per Matteo
1. Ordine: ok fondere **dopo** Code, solo se l'esito è FATTO? In alternativa, prima di Code.
2. Vuoi che lo script fermi la fusione se i controlli CI della PR non sono verdi? Oggi il repository non ha CI, quindi propongo di non controllarli finché non esiste.
3. Il Master Index va aggiornato per citare la V0.3? Propongo di no finché Matteo non la approva, e di farlo nel task successivo (come già scritto nel task per la V0.2 e il suo `DEPRECATED`).
4. Conferma sul formato a chiavi piatte (sopra). In alternativa serve un parser YAML più grosso.

## Non verificato
- Nessun comando `gh pr merge` o `gh pr close` è stato provato, nemmeno in simulazione.
- Non ho controllato come si comporta `gh pr view --json files` sul tuo account, né se ha limiti di paginazione. È la prima cosa da provare in esecuzione.
- Non ho letto `LEGGIMI.md` prima di riga 40, né `installa.ps1`.

Comandi bloccati dai permessi: 0

---

## CT-DEV-001 - fase esecuzione - 2026-11-01 13:31 - FATTO

## Resoconto CT-DEV-001

**Richiesta eseguita:** sì, ma l'estrazione non è stata provata. Il codice è scritto e la PR è aperta, però non ho potuto far girare PowerShell.

**Cosa è stato fatto** (solo file in `strumenti/windows-scambio/`):
- `osserva-scambio.ps1`: Code ora parte con `--output-format stream-json --verbose`. Il flusso grezzo va in `esecuzioni\<data>-<id>-<fase>\flusso.jsonl`.
- Nuova funzione `Estrai-Flusso`: dal flusso ricava il testo finale del resoconto e `comandi.txt`. Per ogni comando scrive l'esito: eseguito, BLOCCATO dai permessi o ERRORE.
- Token e chiavi nei comandi vengono coperti con `[COPERTO]`.
- In fondo al resoconto su `REPORT.md` finisce una riga col numero di comandi bloccati e i primi 5. La riga c'è sempre, anche con 0 bloccati.
- Nuovo parametro `-Prova <file.jsonl>`: stampa resoconto, `comandi.txt` e riga dei bloccati da un flusso salvato, senza lanciare Code.
- Aggiunto `prove/flusso-esempio.jsonl`. Contiene un comando eseguito, due bloccati (uno con token finto), un errore e un risultato finale.
- Aggiornato il LEGGIMI.

**`git diff --stat` rispetto a main:**
- `LEGGIMI.md`: 7 righe
- `osserva-scambio.ps1`: 123 righe
- `prove/flusso-esempio.jsonl`: 13 righe nuove
- Totale: 3 file, 139 inserimenti, 4 cancellazioni

**Branch e PR:**
- Branch: `fix/ct-dev-001-log-comandi`
- Commit: `4478be3`
- PR #68 verso `main`: https://github.com/servisys/cosmic-horror/pull/68
- Sono tornato su `main`.

**Verifiche eseguite:** nel file `.ps1` non ci sono caratteri non ASCII. Nessun file fuori da `strumenti/windows-scambio/` è cambiato.

**Cose non eseguite davvero:**
- La funzione di estrazione non è mai girata: il comando PowerShell è stato negato dai permessi di questa fase. Il file di esempio è quindi non provato.
- Il formato reale di stream-json è quello che mi aspetto, non l'ho visto in una esecuzione vera. Mi aspetto:
  - blocchi `tool_use` e `tool_result`;
  - un evento finale `result` con `permission_denials`;
  - il testo del rifiuto riconosciuto da una regola di testo (`permission`, `haven't granted`, `not allowed`, `was denied`).
- Se il formato reale è diverso, la funzione potrebbe non vedere i comandi bloccati. Con un flusso illeggibile il resoconto ricade sul messaggio di errore già esistente.
- Quel ripiego non l'ho provato.
- Il punto più incerto è proprio il riconoscimento dei comandi bloccati.

**Prova da fare (Matteo):**
```
powershell -NoProfile -ExecutionPolicy Bypass -File strumenti\windows-scambio\osserva-scambio.ps1 -Prova strumenti\windows-scambio\prove\flusso-esempio.jsonl
```
Dovrebbe mostrare 5 comandi, di cui 2 bloccati (`git push origin main` e il `curl` con token coperto), e la riga dei bloccati.

Dopo la fusione serve reinstallare lo script, come previsto dal task.

---

## CT-DEV-001 - fase piano - 2026-11-01 13:22 - FATTO

# Pre-flight plan CT-DEV-001 (fase piano, solo lettura)

## Richiesta eseguita
Letto `TASK.md`, i documenti autorevoli, `osserva-scambio.ps1` e `LEGGIMI.md`. Nessun file modificato.

## Verifiche
- `docs/00_MASTER_INDEX.md` è APPROVED 0.5.0. `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md` è APPROVED, approvato da Matteo il 2026-11-01.
- Le PR #66 (canale automatico) e #67 (approvazioni) sono fuse in `main`. Il task dice di partire da `main` dopo la fusione, quindi la base giusta è `main`.
- Il repository di lavoro è pulito, su `main`.
- Il task è pronto: nessun motivo di blocco.

## Passi
1. Creare `fix/ct-dev-001-log-comandi` da `main`.
2. In `osserva-scambio.ps1`, cambiare la chiamata a Code:
   - usare `--output-format stream-json --verbose`;
   - mandare lo stdout in `flusso.jsonl` nella cartella dell'esecuzione;
   - togliere `resoconto.md` come file di uscita.
3. Aggiungere una funzione di estrazione, scritta in PowerShell 5.1 con soli caratteri ASCII e senza nuove dipendenze. Legge il `.jsonl` riga per riga e ricava due cose:
   - **Resoconto.** Il testo viene dalla riga `type=result`, campo `result`. Se manca, per esempio dopo un timeout, si usa l'ultimo testo dell'assistente. Il testo pubblicato resta quello di oggi.
   - **Comandi.** Si abbinano le chiamate `tool_use` (`name`, `input`) ai `tool_result` tramite `tool_use_id`. Ogni comando prende un esito: eseguito, bloccato dai permessi (`is_error` con messaggio di permesso negato) o errore. Il risultato va in `comandi.txt`.
4. Mascherare i segreti nel testo dei comandi, sia in `comandi.txt` sia nella riga pubblicata. I pattern sono: `ghp_`, `github_pat_`, `sk-…`, `Bearer …`, `password=`, `token=`, `key=` e simili, sostituiti con `***`.
5. Aggiungere in fondo al corpo pubblicato in `REPORT.md` una sola riga: «Comandi bloccati: N» più i primi 5 comandi, mascherati. Il resto del corpo non cambia.
6. Gestire i casi limite: righe json non valide, flusso vuoto o troncato. Se l'estrazione fallisce, si ricade sul messaggio di errore attuale, con le ultime righe di `errori.txt`.
7. Aggiungere `strumenti/windows-scambio/prove/flusso-esempio.jsonl`. È un flusso finto con un comando eseguito, uno bloccato, un errore e un finto token. Aggiungere anche l'output atteso, `comandi-atteso.txt` e `resoconto-atteso.md`. Per provare la funzione, aggiungere un parametro `-Prova <file.jsonl>` che stampa resoconto e comandi senza toccare git né lanciare Code.
8. Aggiornare `LEGGIMI.md`: dove stanno `flusso.jsonl` e `comandi.txt` (nella cartella `esecuzioni\<data>-<id>-<fase>\`), la riga dei comandi bloccati e l'uso di `-Prova`.
9. Commit, `git push -u origin HEAD`, PR verso `main` con descrizione in italiano, poi `git switch main`.

## File toccati
Tutti sotto `strumenti/windows-scambio/`:
- `osserva-scambio.ps1` (modificato)
- `LEGGIMI.md` (modificato)
- `prove/flusso-esempio.jsonl` (nuovo)
- `prove/comandi-atteso.txt` (nuovo)
- `prove/resoconto-atteso.md` (nuovo)

Niente cambia fuori da quella cartella. `installa.ps1` e `disinstalla.ps1` restano uguali.

## Come si prova con i permessi della fase esecuzione
Il task vuole una prova con il flusso di esempio. Nella fase esecuzione Code non può lanciare PowerShell: l'elenco permessi ha solo git, npm e gh, senza `powershell` e senza `node`. Quindi:
- **In fase esecuzione:** ricontrollo a mano il codice sul flusso di esempio, passo per passo, e confronto con i file attesi. Il resoconto dirà chiaramente che la funzione non è stata eseguita.
- **Dopo:** Matteo lancia `osserva-scambio.ps1 -Prova prove\flusso-esempio.jsonl` e confronta con i file attesi.
- Allego `git diff --stat` al resoconto, come richiesto.

## Rischi
- **Formato del flusso.** I nomi dei campi di `stream-json` li conosco a memoria e non posso verificarli senza lanciare Code. Il flusso di esempio rischia di non coincidere con quello reale. Per questo l'estrazione sarà tollerante: ignora i campi mancanti e ricade sull'errore attuale.
- **Esito «bloccato».** Il riconoscimento si basa sul testo del messaggio di permesso negato di Code. Se il testo cambia, un comando bloccato appare come «errore». Userò più indizi insieme (`is_error` più parole chiave) e lo dichiarerò.
- **Dimensioni.** Il flusso con `--verbose` può pesare diversi MB. Resta solo sul PC. Non c'è rotazione, e propongo di non farla ora.
- **Codifica.** L'output è UTF-8. Nel file `.ps1` resto ASCII, anche per le parole chiave italiane.
- **Mascheratura.** Con i pattern non si coprono tutti i segreti possibili. Il flusso grezzo contiene i segreti non mascherati, ma non lascia il PC.
- **Reinstallazione.** Lo script in uso sta in `%USERPROFILE%\CosmicHorrorScambio`. Il cambio vale solo dopo la reinstallazione, che è fuori scope.

## Domande per Matteo
1. Il parametro `-Prova` (nuovo) va bene per provare la funzione? Senza di esso non c'è un modo semplice di lanciarla sul file di esempio.
2. Serve una pulizia dei vecchi `flusso.jsonl`, per esempio dopo 30 giorni? Propongo di no per ora.
3. Vuoi che `comandi.txt` includa anche i comandi eseguiti con successo, oltre ai bloccati? Il task dice di sì (ogni comando con esito). Procedo così salvo diversa indicazione.

## Non verificato in questa fase
- Non ho controllato il formato reale di `stream-json` della versione di Code installata.
- Non ho controllato se il branch `fix/ct-dev-001-log-comandi` esiste già in locale o su origin.

---

## CT-DOC-001 - fase esecuzione - 2026-11-01 12:44 - FATTO

# Resoconto CT-DOC-001

**Il task è fatto a metà.** Le modifiche e il commit ci sono, ma non sono riuscito a fare push, a aprire la PR né a tornare su `main`.

## Cosa non ha funzionato
- `git push` è stato bloccato: la sessione automatica non ha avuto il permesso di eseguirlo.
- `git checkout main` è stato bloccato allo stesso modo. Il repo di lavoro è ancora sul branch `planning/ct-doc-001-approvazioni`, con l'albero pulito.
- La PR non esiste. Senza il push non si poteva aprire.

## Cosa è stato fatto
- Ho creato il branch `planning/ct-doc-001-approvazioni` da `origin/feature/ct-scambio-automatico` e ci ho fatto un commit, solo in locale. Il commit è «CT-DOC-001: approvati Master Index 0.5.0 e protocollo Cowork-Code V0.2; V0.1 deprecata».
- `docs/00_MASTER_INDEX.md`:
  - `status: APPROVED`, versione 0.5.0, `last_reviewed: 2026-11-01`.
  - I due riferimenti al protocollo (§1 punto 2 e indice Governance) ora puntano alla V0.2.
  - Aggiunta la riga 0.5.0 nel changelog.
- `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md`:
  - `status: APPROVED`.
  - Tolta la riga «PROPOSTA ... DA CONFERMARE DA MATTEO».
  - Aggiunta la riga di changelog.
- `docs/CT_COWORK_CODE_PROTOCOL_V0.1.md`:
  - `status: DEPRECATED`.
  - Aggiunto `superseded_by: CT_COWORK_CODE_PROTOCOL_V0.2.md`.
  - `last_reviewed` non toccato.
  - Aggiunta la riga di changelog.

## Verifiche
- `git diff --stat`: 3 file, 11 inserimenti e 9 cancellazioni, tutti in `docs/`.
- Il diff completo l'ho riletto e corrisponde all'elenco qui sopra. L'ho solo visto a terminale, non l'ho incollato in questo resoconto.
- Nessun file fuori da `docs/` risulta modificato.

## Da sapere
- Insieme alla riga «PROPOSTA ...» ho tolto anche la frase che segue nella stessa riga («Rispetto alla V0.1 aggiunge il canale automatico... Il canale manuale della V0.1 resta valido»). Il task chiedeva di togliere la riga intera. Se quella frase va conservata, va rimessa a mano.
- Nel changelog ho aggiunto una riga nuova per ogni stato, senza sovrascrivere quelle esistenti: 0.2.0 compare due volte (DRAFT e APPROVED), e lo stesso vale per la 0.1.0.

## Riferimenti alla V0.1 non toccati (come da task)
- `README.md`.
- `docs/00-project-overview/01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md`.
- `docs/CT_COPILOT_CLAUDE_PROTOCOL.md`.
- Molti file in `scambio/` (storico locale, non tracciato).
- Non ho controllato se la V0.2 contiene riferimenti alla V0.1: si cita da sola, quindi probabilmente sì.

## Cosa serve da Matteo
Da una sessione interattiva:
1. `git push -u origin planning/ct-doc-001-approvazioni`
2. Aprire la PR con base `feature/ct-scambio-automatico`. La descrizione deve dire di fonderla dopo la PR del canale automatico.
3. Tornare su `main` nel repo di lavoro.

## Cosa non ho verificato
- Non ho verificato la PR (non esiste) e non ho lanciato test di codice (il task toccava solo documenti).

---

## CT-DOC-001 - fase piano - 2026-11-01 12:35 - FATTO

# Pre-flight plan CT-DOC-001 (fase piano, solo lettura)

## Richiesta eseguita
Letto TASK.md e i tre documenti. Non ho modificato nulla.

## Verifica documenti
- **Approvazione di Matteo:** è una citazione riportata da Cowork («ok approvo Master Index e protocollo»). Non l'ho potuta verificare in modo indipendente. Il TASK la indica come fonte autorevole e il canale automatico non porta deleghe, ma qui serve solo un'approvazione di stato, non una fusione.
- **Master Index:** `status: DRAFT`, v0.4.0, `last_reviewed` 2026-10-31. Il TASK lo porta ad `APPROVED`.
- **Protocollo V0.1:** su `main`, `DRAFT`.
- **Protocollo V0.2:** `DRAFT`, v0.2.0. Esiste solo su `origin/feature/ct-scambio-automatico`. Rispetto a `main` quel branch aggiunge solo la V0.2 e 4 file in `strumenti/windows-scambio/`, quindi il diff è pulito.
- **Stato dei documenti:** quindi sono ancora DRAFT, come previsto dal task. Diventano APPROVED solo con l'esecuzione, e solo dopo un nuovo via.

## Punto 3: strada proposta
**Consiglio: creare `planning/ct-doc-001-approvazioni` da `feature/ct-scambio-automatico` e aprire la PR verso quel branch.**

- **Pro:**
  - Un'unica PR sistema tutti i documenti.
  - La V0.2 viene approvata nel punto in cui esiste.
  - Non si mescolano i file di `strumenti/` con una PR su `main`.
- **Contro:**
  - La PR di questo task dipende dall'altra. Se Matteo chiude o cambia quella PR, questa va rifatta.
  - Il Master Index sarebbe approvato solo dopo due fusioni in ordine (prima la feature, poi questa).
  - Il diff della PR verso `main` mostrerebbe anche i file di `strumenti/`, quindi conviene puntarla al branch feature.

**Alternativa:** solo il Master Index ora, su `main`. Ma allora cita ancora la V0.1, oppure punta a un file V0.2 che su `main` non c'è. È peggio, perché lascia un riferimento rotto. La sconsiglio.

## File toccati (tutti in `docs/`)
1. `docs/00_MASTER_INDEX.md`:
   - front matter: `status: APPROVED`, versione, `last_reviewed: 2026-11-01`;
   - riga 24 (§1) e riga 61 (§4): da V0.1 a V0.2;
   - una nuova riga di changelog.
2. `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md`:
   - `status: APPROVED`;
   - tolta la riga «PROPOSTA … DA CONFERMARE»;
   - una riga di changelog.
3. `docs/CT_COWORK_CODE_PROTOCOL_V0.1.md`: solo `status: DEPRECATED`.

## Proposte sulla versione
- **Master Index:** passare da 0.4.0 a **0.5.0**, senza rinominare il file. Il nome non contiene la versione.
- **Protocollo V0.2:** resta `version: 0.2.0`, perché nome file e versione devono coincidere. Il changelog riceve la riga «0.2.0 | APPROVED | approvato da Matteo il 2026-11-01».
- **Cambio di stato in-place:** la regola «non si sovrascrive mai un file» del protocollo (§5) vale per il contenuto. Il cambio di stato nello stesso file è previsto dal TASK. Lo segnalo comunque nel resoconto.

## Rischi
- **Riferimenti alla V0.1 fuori scope che resterebbero:**
  - `README.md` riga 10;
  - `docs/00-project-overview/01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md`, righe 13 e 53;
  - `docs/CT_COPILOT_CLAUDE_PROTOCOL.md` (`superseded_by` e riga 11).
  
  Il TASK vieta di toccare altri documenti, quindi li lascerei così. Puntano a un file DEPRECATED, che resta presente.
- **Riga 293 del changelog del Master Index:** cita la V0.1 ma è storica. Non la tocco.
- **Link della V0.2 e dipendenza dall'ordine di fusione:** il Master Index punta a un file che su `main` esiste solo dopo la fusione della PR feature. Va fusa prima la PR feature, poi questa.
- **Criterio di diff limitato:** le due righe di riferimento (24 e 61) rientrano nell'eccezione prevista dal TASK. Il resto del testo non cambia.

## Domande per Matteo
1. Va bene la strada del punto 3 (branch da `feature/ct-scambio-automatico`, PR verso quel branch)?
2. Master Index a 0.5.0 va bene, oppure preferisci 1.0.0 per segnare la prima versione approvata?
3. Nella V0.1 `DEPRECATED`, aggiungo `superseded_by: CT_COWORK_CODE_PROTOCOL_V0.2.md` nel front matter, come già fa il file Copilot? Il TASK dice «senza altre modifiche», quindi senza tuo ok non lo faccio.
4. Vuoi che `last_reviewed` della V0.1 cambi? Nel piano lo lascio com'è.
5. I riferimenti alla V0.1 in README e Vision vanno aggiornati in un task a parte? Consiglio di sì.

## Cosa non ho verificato
- L'approvazione di Matteo, che è solo riportata.
- Se esiste già una PR aperta per `feature/ct-scambio-automatico` e il suo stato (ho letto solo il branch).
- Se `planning/ct-doc-001-approvazioni` esiste già in locale o sul remoto.

## Branch e PR
Nessun branch creato, nessun commit, nessuna PR. Il repository è rimasto su `main`, pulito.

**Il task è pronto per l'esecuzione, in attesa delle risposte alle domande 1–3 e del nuovo via di Matteo.**

---

## CT-TEST-001 - fase piano - 2026-11-01 12:15 - FATTO

**Resoconto CT-TEST-001 (fase piano)**

**Richiesta eseguita:** prova del canale automatico, sola lettura.

**Verifiche (punti 1–4):**
1. Branch attuale: `main`. Ultimo commit di `main`: `018ed1b`, 2026-11-01 (10:58 +01:00).
2. `strumenti/windows-scambio/` non esiste sul branch attuale. La PR #66 (`feature/ct-scambio-automatico`) sembra introdurre gli strumenti Windows, ma non l'ho controllato.
3. `gh` risponde. C'è 1 PR aperta: #66 "Canale automatico di scambio: strumenti Windows e protocollo V0.2 (DRAFT)", aperta il 2026-11-01.
4. Ho letto file e lanciato `git status`. Risultato: pulito, 0 modifiche. In fase piano posso solo leggere, quindi non ho modificato nulla.

**Documenti autorevoli:** non sono APPROVED.
- `docs/00_MASTER_INDEX.md` ha `status: DRAFT` (v0.4.0).
- `docs/CT_COWORK_CODE_PROTOCOL_V0.1.md` ha `status: DRAFT`.

Il task non scrive codice, quindi per questa prova non blocca. Un task reale su quei documenti sarebbe da fermare finché Matteo non li approva.

**Pre-flight plan:**
- Passi: nessuno da eseguire oltre alle letture sopra.
- File toccati: nessuno.
- Rischi: nessuno.
- Domande aperte: nessuna.

**Branch e PR:** nessun branch creato, nessun commit, nessun push. Ho solo letto la PR #66 dall'elenco, senza toccarla.

**Non verificato:** il contenuto della PR #66 e il fatto che `REPORT.md` arrivi sul branch `scambio`, perché lo pubblica lo script.

---

Nessun resoconto ancora.
