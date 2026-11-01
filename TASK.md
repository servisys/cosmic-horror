---
id: CT-DOC-002
fase: esecuzione
pronto: si
branch: planning/ct-doc-002-protocollo-v04
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DOC-002 — Approvazione del protocollo con le fusioni tramite Cowork, più due regole di sicurezza

## Documenti autorevoli
- Approvazione di Matteo in chat a Cowork il 2026-11-01: proposta di Cowork «approvo la V0.3 con le regole dei punti 2 e 3», risposta di Matteo «sì». Punto 2 = `file_attesi` obbligatorio; punto 3 = fusioni e chiusure solo in un task dedicato.
- `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md` (APPROVED), `docs/CT_COWORK_CODE_PROTOCOL_V0.3.md` (DRAFT), `docs/00_MASTER_INDEX.md` (APPROVED 0.5.0).
- `strumenti/windows-scambio/osserva-scambio.ps1`, `LEGGIMI.md`, `prove/`.

## Via di Matteo e risposte al pre-flight plan
Matteo ha dato il via all'esecuzione in chat a Cowork il 2026-11-01 («sì vai»). Segui il pre-flight plan. Risposte:
1. Sì a `tipo: deleghe`.
2. Sì alla strada V0.4 (V0.3 e V0.2 `DEPRECATED` con `superseded_by`).
3. Riferimenti alla V0.1 in README e Vision: task a parte più avanti, non toccarli ora.
In questa fase PowerShell è bloccato: non tentare di lanciare le prove. Scrivi i file attesi ragionando sul codice e indica nel resoconto il comando esatto per le prove, che verranno lanciate in sessione interattiva prima della fusione.

## Obiettivo
Rendere in vigore il protocollo che permette fusioni e chiusure tramite Cowork, aggiungendo due regole di sicurezza, e allineare lo script.

## Scope incluso
1. **Nuova versione approvata del protocollo.** La V0.3 è DRAFT e il suo testo va cambiato: secondo le regole sui file proponi tu se creare una **V0.4 APPROVED** (copia della V0.3 + le due regole, V0.3 lasciata com'è ma `DEPRECATED` con `superseded_by`) oppure un'altra strada più pulita. In ogni caso: V0.2 → `DEPRECATED` con `superseded_by`, nessun'altra modifica al testo delle versioni vecchie, righe di changelog.
2. **Le due regole nel protocollo (§3):**
   - `file_attesi_<numero>` **obbligatorio** per ogni fusione; Cowork lo compila dopo aver letto il diff della PR su GitHub.
   - Fusioni e chiusure solo in un **task dedicato**, il cui unico scopo è fondere o chiudere PR già aperte e già controllate da Cowork; mai nello stesso task di un lavoro nuovo. Lo script esegue le deleghe solo se il task ha anche un campo esplicito che lo dichiara (per esempio `tipo: deleghe`; proponi tu il nome), altrimenti le ferma con il motivo.
   - In §8: la protezione di `main` ora esiste (ruleset con PR obbligatoria, niente force push né cancellazione): aggiorna il punto aperto.
3. **Master Index:** riferimenti al protocollo aggiornati alla nuova versione approvata, versione 0.6.0, riga di changelog. Nient'altro.
4. **Script:** `osserva-scambio.ps1` ferma ogni fusione senza `file_attesi_<numero>` e ogni delega in un task senza il campo del punto 2; prove in `prove/` aggiornate (nuovi casi: fusione senza `file_attesi`, task senza il campo «deleghe»); LEGGIMI aggiornato.
5. PR verso `main`, descrizione in italiano.

## Fuori scope
- Fondere o chiudere PR in questo task (la PR di questo task sarà la prima fusione tramite Cowork, in un task dedicato successivo).
- Cambiare altri documenti, il gioco, il ruleset o le impostazioni del repository.
- Reinstallare lo script.

## Vincoli tecnici
- Base `main`. Push solo con `git push -u origin HEAD`, poi `git switch main`.
- PowerShell 5.1, solo ASCII nei .ps1, nessuna nuova dipendenza.

## Criteri di accettazione
- Un solo protocollo APPROVED (la nuova versione), le altre DEPRECATED con `superseded_by`.
- Script: nessuna fusione senza `file_attesi`; nessuna delega in un task senza il campo «deleghe»; comportamento invariato per i task senza deleghe.
- Diff limitato a `docs/` (protocollo e Master Index) e `strumenti/windows-scambio/`.

## Test obbligatori
- `git diff --stat`.
- Prove in `prove/` (se non puoi eseguirle in fase esecuzione, scrivilo e indica il comando).

## Output richiesto
- Fase `piano`: pre-flight plan con la strada per le versioni, il nome del campo «deleghe», file toccati, rischi, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR e cosa non è stato verificato.
