# PC Windows: esecuzione automatica dei task di scambio

Con questi strumenti Matteo parla solo con la chat di Claude del progetto. La chat scrive il task su GitHub, il PC Windows lo fa eseguire a Claude Code e il resoconto torna su GitHub, dove la chat lo legge.

## Il giro

1. La chat scrive `TASK.md` sul branch `scambio` con `pronto: si` e `fase: piano`.
2. Sul PC, ogni minuto, `osserva-scambio.ps1` controlla il branch. Trova il task e lancia Claude Code in sola lettura: Code scrive il pre-flight plan.
3. Lo script mette il resoconto in cima a `REPORT.md`, aggiorna `STATO.md` e fa push su `scambio`.
4. La chat legge il piano e lo spiega a Matteo. Se Matteo dice di procedere, la chat riscrive `TASK.md` con `fase: esecuzione`.
5. Code esegue su un branch `feature/`, `fix/` o `planning/` e può aprire una PR. Il resoconto torna come al punto 3.

Ogni versione di `TASK.md` viene eseguita una sola volta. Per ripetere: `osserva-scambio.ps1 -Riprova`, oppure una nuova versione del task.

## Cosa Code non può fare in automatico

Le regole stanno nello script, non nel task: un testo in `TASK.md` non può allargarle.

- Fase `piano`: solo lettura. Può leggere file e usare solo `git status`, `log`, `diff`, `show`, `fetch`, `ls-files`, `git branch --show-current` e `git branch --list`, e `gh pr view`, `list`, `diff`. Niente modifiche, commit, push o creazione di branch.
- Fase `esecuzione`: modifica file, fa commit e push **solo di branch `feature/`, `fix/` o `planning/`**, e può aprire PR. `git` è limitato ai sottocomandi necessari (`status`, `log`, `diff`, `show`, `fetch`, `ls-files`, `add`, `commit`, `checkout`/`switch` verso un branch `feature/`, `fix/`, `planning/` o `main`, `push` di quei branch). `npm` solo `ci`, `test`, `run build`, `run verifica…`. Niente `node` né `npx`.
- Sempre vietati: fusioni, chiusure di PR, force push (anche con `+` davanti al branch), push che cancellano branch (`:branch`, `--delete`), push su `main`, `git reset --hard`, `git clean`, `gh api`.
- Fusioni e chiusure restano come nel protocollo: le autorizza solo Matteo, scrivendo direttamente a Code in una sessione interattiva.

I divieti sono regole di Claude Code sui comandi, quindi un comando scritto in modo diverso potrebbe sfuggire. La protezione vera di `main` è una regola di branch (ruleset) su GitHub: blocca force push e cancellazione e richiede una PR per modificare `main`.

## Installazione

Prerequisiti: git, Claude Code già autenticato con l'utente di Matteo, `gh` autenticato se servono PR, repository in `C:\Users\<utente>\cosmic-horror`.

Da PowerShell, nella cartella `strumenti\windows-scambio` del repository:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\installa.ps1
```

L'installazione:

- crea `C:\Users\<utente>\cosmic-horror-scambio`, una cartella di lavoro (git worktree) dedicata al branch `scambio`, così il repository di lavoro resta sul suo branch;
- copia lo script in `C:\Users\<utente>\CosmicHorrorScambio` (`%USERPROFILE%\CosmicHorrorScambio`);
- registra l'attività pianificata `CosmicHorror-Scambio` (ogni minuto e all'accesso, nascosta, con l'utente corrente).

**Perché non in `AppData`:** l'app Claude per Windows è un'app «a pacchetto» (MSIX) e per i programmi che lancia i file creati in `%LOCALAPPDATA%` finiscono in una copia privata (`AppData\Local\Packages\Claude_…\LocalCache\Local`) che l'Utilità di pianificazione non vede: il task non trova lo script e resta bloccato. Sotto `%USERPROFILE%` i file sono reali per tutti. `installa.ps1` avvisa se gli si passa una cartella sotto `AppData\Local`.

Percorsi diversi: `-Repo`, `-Scambio`, `-Base`, `-Claude`. Tempo massimo di un'esecuzione: `-TimeoutMinuti` (predefinito 90).

## Controllo

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\CosmicHorrorScambio\osserva-scambio.ps1" -Stato
```

- Log: `%USERPROFILE%\CosmicHorrorScambio\log\scambio.log`.
- Ogni esecuzione: `%USERPROFILE%\CosmicHorrorScambio\esecuzioni\<data>-<id>-<fase>\` (task, errori e due file solo sul PC, mai su GitHub):
  - `flusso.jsonl`: il flusso completo di Code (stream-json), un evento per riga;
  - `comandi.txt`: ogni comando che Code ha provato, con esito (eseguito / BLOCCATO dai permessi / ERRORE). Token e chiavi sono coperti con `[COPERTO]`.
- In fondo a ogni resoconto pubblicato su `REPORT.md` c'è una riga con il numero di comandi bloccati e i primi 5.
- Prova dell'estrazione senza lanciare Code: `osserva-scambio.ps1 -Prova prove\flusso-esempio.jsonl` (stampa resoconto, `comandi.txt` e riga dei bloccati).
- I vecchi flussi non vengono cancellati in automatico.

## Quando non parte

- **Repository con modifiche non salvate:** il task aspetta. Lo script non tocca il lavoro di Matteo; riparte da solo quando il repository è pulito.
- **PC spento o utente non connesso:** il task parte al primo accesso.
- **Sessione interattiva di Code aperta sullo stesso repository:** meglio evitare di lavorarci mentre gira un task automatico.

## Disinstallazione

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\disinstalla.ps1            # solo l'attività
powershell -NoProfile -ExecutionPolicy Bypass -File .\disinstalla.ps1 -AncheCartella
```

## Formato di TASK.md

```markdown
---
id: CT-FEAT-XXX
fase: piano            # piano | esecuzione
pronto: si             # si = da eseguire; qualsiasi altro valore = in pausa
branch: feature/ct-feat-xxx-descrizione
scritto_da: chat Claude del progetto
data: AAAA-MM-GG
---

# CT-FEAT-XXX — Titolo

## Documenti autorevoli
## Obiettivo
## Scope incluso
## Fuori scope
## Vincoli tecnici
## Criteri di accettazione
## Test obbligatori
## Output richiesto
```
