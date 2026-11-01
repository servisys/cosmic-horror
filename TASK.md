---
id: CT-DEV-001
fase: piano
pronto: si
branch: fix/ct-dev-001-log-comandi
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DEV-001 — Registro completo delle esecuzioni del canale automatico

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED 0.5.0, se la PR delle approvazioni è fusa; altrimenti sul branch della PR).
- `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md` (APPROVED, stessa nota) — §2.1 canale automatico.
- `strumenti/windows-scambio/LEGGIMI.md` e `osserva-scambio.ps1`.
- Richiesta di Matteo in chat a Cowork il 2026-11-01: «facciamo anche il 2» (proposta di Code nel resoconto del 2026-11-01: salvare il flusso json di Code).

## Obiettivo
Oggi il log di un'esecuzione contiene solo il testo finale di Code: quando un comando viene bloccato non si vede quale. Lo script deve salvare il flusso completo dell'esecuzione, così si capisce subito cosa è successo.

## Scope incluso
1. In `osserva-scambio.ps1` lancia Code con `--output-format stream-json --verbose` e salva il flusso grezzo in `esecuzioni\<data>-<id>-<fase>\flusso.jsonl`.
2. Ricava dal flusso il testo finale del resoconto (quello che oggi va in `REPORT.md`), senza cambiare cosa finisce su GitHub.
3. Ricava dal flusso un file `comandi.txt` leggibile: ogni comando che Code ha provato, con esito (eseguito / bloccato dai permessi / errore). In fondo al resoconto pubblicato aggiungi solo una riga con il numero di comandi bloccati e i primi 5 (testo del comando), così Cowork li vede da GitHub.
4. Il flusso e `comandi.txt` restano solo sul PC (nessun segreto su GitHub: se nel testo dei comandi compaiono token o chiavi, coprili).
5. Aggiorna il LEGGIMI (dove trovare i due file).
6. PR con base `main`, descrizione in italiano.

## Fuori scope
- Fusioni, chiusure di PR, cancellazione di branch (le decide Matteo direttamente).
- Cambiare i permessi delle due fasi o il formato di `TASK.md`, `REPORT.md`, `STATO.md` (salvo la riga del punto 3).
- Reinstallare lo script: dopo la fusione lo farà Matteo o Code in sessione interattiva.

## Vincoli tecnici
- Base: `main` dopo la fusione della PR del canale automatico. Se nel piano risulta non ancora fusa, dillo e proponi la base giusta.
- Windows PowerShell 5.1, solo ASCII nei file .ps1 (come oggi), nessuna nuova dipendenza.
- Push solo con `git push -u origin HEAD`; a fine lavoro torna su `main`.

## Criteri di accettazione
- Con un flusso json di esempio (salvato nel repository come file di prova sotto `strumenti/windows-scambio/prove/`) la funzione che ricava resoconto e `comandi.txt` dà il risultato atteso, compreso un comando bloccato.
- Il testo pubblicato in `REPORT.md` resta uguale a oggi più la riga dei comandi bloccati.
- Nessun file fuori da `strumenti/windows-scambio/` cambiato.

## Test obbligatori
- Prova della funzione di estrazione sul flusso di esempio (descrivi come l'hai verificata se in fase esecuzione non puoi lanciare PowerShell: in quel caso scrivilo chiaramente fra le cose non verificate).
- `git diff --stat` nel resoconto.

## Output richiesto
- Fase `piano`: pre-flight plan (passi, file toccati, come si prova con i permessi della fase esecuzione, rischi, domande per Matteo).
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR e cosa non è stato verificato.
